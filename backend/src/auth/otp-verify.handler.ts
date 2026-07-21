/**
 * otp-verify.handler.ts
 * POST /auth/otp/verify
 *
 * 1. Validate inputs
 * 2. Check lockout key — reject immediately if locked
 * 3. Get stored OTP hash from Redis
 * 4. Compare hashes — increment attempts on mismatch, lockout at 5
 * 5. On match: delete OTP keys, upsert user/provider in Neon DB
 * 6. Issue RS256 access token + rotated refresh token
 * 7. Return { access_token, refresh_token, user }
 */

import type { Request, Response } from 'express';
import { createHash, randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';
import { redis } from '../lib/redis';
import { db } from '../db/client';
import { users } from '../db/schema/users';
import { providers } from '../db/schema/providers';
import { refreshTokens } from '../db/schema/refresh-tokens';
import { signAccessToken } from '../lib/jwt';
import { validateE164, validateOtp, validateRole } from './validators';
import type { Role } from './validators';

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────
const MAX_ATTEMPTS = 5;
const LOCKOUT_TTL_SECONDS = 900; // 15 minutes
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ─────────────────────────────────────────────────────────────
//  Handler
// ─────────────────────────────────────────────────────────────
export async function otpVerifyHandler(req: Request, res: Response): Promise<void> {
  const { phone, otp, role } = req.body as Record<string, unknown>;

  // ── 1. Validate inputs ───────────────────────────────────
  const phoneErr = validateE164(phone);
  if (phoneErr) { res.status(400).json({ error: phoneErr }); return; }

  const roleErr = validateRole(role);
  if (roleErr) { res.status(400).json({ error: roleErr }); return; }

  const otpErr = validateOtp(otp);
  if (otpErr) { res.status(400).json({ error: otpErr }); return; }

  const normalizedPhone = phone as string;
  const otpStr          = otp as string;
  const roleStr         = role as Role;

  // ── 2. Check lockout ─────────────────────────────────────
  const lockoutKey = `otp:lockout:${normalizedPhone}`;
  const isLocked   = await redis.exists(lockoutKey);

  if (isLocked) {
    const ttl = await redis.ttl(lockoutKey);
    res.status(429).json({
      error: 'Too many failed attempts. Try again in 15 minutes.',
      retry_after_seconds: ttl > 0 ? ttl : LOCKOUT_TTL_SECONDS,
    });
    return;
  }

  // ── 3. Fetch stored OTP hash ─────────────────────────────
  const codeKey     = `otp:code:${normalizedPhone}`;
  const attemptsKey = `otp:attempts:${normalizedPhone}`;
  const storedHash  = await redis.get(codeKey);

  if (!storedHash) {
    res.status(400).json({ error: 'OTP expired or not requested.' });
    return;
  }

  // ── 4. Compare hashes ────────────────────────────────────
  const submittedHash = createHash('sha256').update(otpStr).digest('hex');

  if (submittedHash !== storedHash) {
    // Wrong OTP — increment attempt counter
    const attempts = await redis.incr(attemptsKey);

    if (attempts >= MAX_ATTEMPTS) {
      // Lockout: delete OTP keys, set lockout key
      await redis.del(codeKey, attemptsKey);
      await redis.set(lockoutKey, '1', 'EX', LOCKOUT_TTL_SECONDS);
      res.status(429).json({
        error: 'Too many failed attempts. Try again in 15 minutes.',
        retry_after_seconds: LOCKOUT_TTL_SECONDS,
      });
      return;
    }

    res.status(400).json({
      error: 'Invalid OTP.',
      attempts_remaining: MAX_ATTEMPTS - attempts,
    });
    return;
  }

  // ── 5. OTP verified — clean up Redis immediately ─────────
  // Single-use: delete both keys so the OTP can't be reused
  await redis.del(codeKey, attemptsKey);

  // ── 6. Upsert user/provider in Neon DB ───────────────────
  const now = new Date();
  let userId: string;
  let userName: string | null = null;
  let providerStatus: string | undefined;

  if (roleStr === 'customer') {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.phone, normalizedPhone))
      .limit(1);

    if (existing.length === 0) {
      // New user: create row with verified phone
      const [created] = await db
        .insert(users)
        .values({ phone: normalizedPhone, phone_verified_at: now })
        .returning();
      userId   = created.id;
      userName = created.name;
    } else {
      const user = existing[0];
      userId   = user.id;
      userName = user.name;

      // Backfill phone_verified_at if this is their first successful OTP
      if (!user.phone_verified_at) {
        await db
          .update(users)
          .set({ phone_verified_at: now, updated_at: now })
          .where(eq(users.id, user.id));
      }
    }
  } else {
    // provider
    const existing = await db
      .select()
      .from(providers)
      .where(eq(providers.phone, normalizedPhone))
      .limit(1);

    if (existing.length === 0) {
      const [created] = await db
        .insert(providers)
        .values({ phone: normalizedPhone, phone_verified_at: now })
        .returning();
      userId         = created.id;
      userName       = created.name;
      providerStatus = created.status;
    } else {
      const provider = existing[0];
      userId         = provider.id;
      userName       = provider.name;
      providerStatus = provider.status;

      if (!provider.phone_verified_at) {
        await db
          .update(providers)
          .set({ phone_verified_at: now, updated_at: now })
          .where(eq(providers.id, provider.id));
      }
    }
  }

  // ── 7. Issue access token (RS256, 15 min) ────────────────
  const accessToken = signAccessToken({
    sub: userId,
    role: roleStr,
    phone: normalizedPhone,
  });

  // ── 8. Issue refresh token (store hash only) ─────────────
  const rawRefreshToken = randomBytes(40).toString('hex');
  const refreshTokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await db.insert(refreshTokens).values({
    user_id:    userId,
    role:       roleStr,
    token_hash: refreshTokenHash,
    expires_at: expiresAt,
  });

  // ── 9. Build response ────────────────────────────────────
  const userPayload: Record<string, unknown> = {
    id:    userId,
    phone: normalizedPhone,
    name:  userName,
    role:  roleStr,
  };

  // Include status for providers (customers don't have a status field)
  if (providerStatus !== undefined) {
    userPayload.status = providerStatus;
  }

  res.status(200).json({
    access_token:  accessToken,
    refresh_token: rawRefreshToken,
    user:          userPayload,
  });
}
