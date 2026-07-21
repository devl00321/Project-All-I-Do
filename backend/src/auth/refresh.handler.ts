/**
 * refresh.handler.ts
 * POST /auth/refresh
 *
 * Refresh token rotation — true rotation, not reuse:
 *   1. Find the stored token row by sha256(submitted_token)
 *   2. Validate not revoked, not expired
 *   3. Revoke the old token row (set revoked_at)
 *   4. Fetch the user's phone for the JWT payload
 *   5. Issue new access token + new refresh token
 *   6. Store new refresh token hash
 *   7. Return { access_token, refresh_token }
 *
 * If a revoked token is presented (possible replay attack),
 * we return 401 immediately — the client must re-authenticate
 * via OTP.
 */

import type { Request, Response } from 'express';
import { createHash, randomBytes } from 'crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '../db/client';
import { refreshTokens } from '../db/schema/refresh-tokens';
import { users } from '../db/schema/users';
import { providers } from '../db/schema/providers';
import { signAccessToken } from '../lib/jwt';

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function refreshHandler(req: Request, res: Response): Promise<void> {
  const { refresh_token } = req.body as Record<string, unknown>;

  if (typeof refresh_token !== 'string' || !refresh_token.trim()) {
    res.status(400).json({ error: 'refresh_token is required.' });
    return;
  }

  const tokenHash = createHash('sha256').update(refresh_token).digest('hex');
  const now       = new Date();

  // ── Look up valid, non-revoked, non-expired token ────────
  const [storedToken] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.token_hash, tokenHash),
        isNull(refreshTokens.revoked_at),
        gt(refreshTokens.expires_at, now),
      ),
    )
    .limit(1);

  if (!storedToken) {
    // Could be: expired, already revoked, or never existed.
    // Don't distinguish — all are treated as auth failures.
    res.status(401).json({ error: 'Invalid or expired refresh token.' });
    return;
  }

  // ── Revoke old token first (rotation) ────────────────────
  // Do this before issuing the new one so a crash mid-flight
  // doesn't leave two valid refresh tokens alive simultaneously.
  await db
    .update(refreshTokens)
    .set({ revoked_at: now })
    .where(eq(refreshTokens.id, storedToken.id));

  // ── Fetch phone for JWT payload ───────────────────────────
  let phone: string | null = null;

  if (storedToken.role === 'customer') {
    const [u] = await db
      .select({ phone: users.phone })
      .from(users)
      .where(eq(users.id, storedToken.user_id))
      .limit(1);
    phone = u?.phone ?? null;
  } else {
    const [p] = await db
      .select({ phone: providers.phone })
      .from(providers)
      .where(eq(providers.id, storedToken.user_id))
      .limit(1);
    phone = p?.phone ?? null;
  }

  if (!phone) {
    // User was deleted after token was issued — don't issue new tokens
    res.status(401).json({ error: 'Account not found.' });
    return;
  }

  // ── Issue new access token ────────────────────────────────
  const accessToken = signAccessToken({
    sub:   storedToken.user_id,
    role:  storedToken.role,
    phone,
  });

  // ── Issue new refresh token ───────────────────────────────
  const rawRefreshToken  = randomBytes(40).toString('hex');
  const newTokenHash     = createHash('sha256').update(rawRefreshToken).digest('hex');
  const expiresAt        = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await db.insert(refreshTokens).values({
    user_id:    storedToken.user_id,
    role:       storedToken.role,
    token_hash: newTokenHash,
    expires_at: expiresAt,
  });

  res.status(200).json({
    access_token:  accessToken,
    refresh_token: rawRefreshToken,
  });
}
