/**
 * otp-request.handler.ts
 * POST /auth/otp/request
 *
 * 1. Validate phone (E.164) + role
 * 2. Rate-limit: max 3 requests per 10 minutes per phone
 * 3. Generate 6-digit OTP via crypto.randomInt (not Math.random)
 * 4. SHA256-hash and store in Redis with 300s TTL
 * 5. Send via SmsProvider (MSG91 or console fallback)
 * 6. Return { message, expires_in } — OTP never echoed in response
 */

import type { Request, Response } from 'express';
import { createHash, randomInt } from 'crypto';
import { redis } from '../lib/redis';
import { getSmsProvider } from '../lib/sms';
import { validateE164, validateRole } from './validators';

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────
const OTP_TTL_SECONDS = 300;          // 5 minutes
const RATE_LIMIT_WINDOW_SECONDS = 600; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 3;

// ─────────────────────────────────────────────────────────────
//  Handler
// ─────────────────────────────────────────────────────────────
export async function otpRequestHandler(req: Request, res: Response): Promise<void> {
  const { phone, role } = req.body as Record<string, unknown>;

  // ── 1. Validate inputs ───────────────────────────────────
  const phoneErr = validateE164(phone);
  if (phoneErr) {
    res.status(400).json({ error: phoneErr });
    return;
  }

  const roleErr = validateRole(role);
  if (roleErr) {
    res.status(400).json({ error: roleErr });
    return;
  }

  const normalizedPhone = phone as string;

  // ── 2. Rate limit check ──────────────────────────────────
  // Incrementing counter pattern with TTL set only on first request.
  // This is NOT a sliding window — it's a fixed 10-minute bucket.
  const rateLimitKey = `otp:ratelimit:${normalizedPhone}`;
  const count = await redis.incr(rateLimitKey);

  if (count === 1) {
    // First request in this window — set the TTL
    await redis.expire(rateLimitKey, RATE_LIMIT_WINDOW_SECONDS);
  }

  if (count > RATE_LIMIT_MAX_REQUESTS) {
    const ttl = await redis.ttl(rateLimitKey);
    res.status(429).json({
      error: `Too many OTP requests. Maximum ${RATE_LIMIT_MAX_REQUESTS} per 10 minutes.`,
      retry_after_seconds: ttl > 0 ? ttl : RATE_LIMIT_WINDOW_SECONDS,
    });
    return;
  }

  // ── 3. Generate OTP ──────────────────────────────────────
  // crypto.randomInt is cryptographically secure, unlike Math.random.
  // 0–999999 padded to always produce 6 digits: '000001', '987654', etc.
  const otp = randomInt(0, 1_000_000).toString().padStart(6, '0');

  // ── 4. Hash and store in Redis ───────────────────────────
  // SHA256 is sufficient here: OTPs are short-lived (5 min), low entropy
  // by design, and this is just a comparison guard — not a password store.
  const otpHash = createHash('sha256').update(otp).digest('hex');

  const codeKey    = `otp:code:${normalizedPhone}`;
  const attemptsKey = `otp:attempts:${normalizedPhone}`;

  // Atomic: overwrite any existing OTP (re-request replaces previous)
  await Promise.all([
    redis.set(codeKey, otpHash, 'EX', OTP_TTL_SECONDS),
    redis.set(attemptsKey, '0', 'EX', OTP_TTL_SECONDS),
  ]);

  // ── 5. Send SMS ──────────────────────────────────────────
  try {
    const sms = getSmsProvider();
    await sms.sendOtp(normalizedPhone, otp);
  } catch (err) {
    // Roll back the Redis write if SMS fails so the user can retry
    await Promise.all([
      redis.del(codeKey),
      redis.del(attemptsKey),
      // Decrement rate limit counter so the failed attempt doesn't count
      redis.decr(rateLimitKey),
    ]).catch(() => {}); // best-effort cleanup

    console.error('[auth/otp/request] SMS send failed:', err);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
    return;
  }

  // ── 6. Respond — never include the OTP ──────────────────
  res.status(200).json({
    message: 'OTP sent',
    expires_in: OTP_TTL_SECONDS,
  });
}
