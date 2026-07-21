/**
 * jwt.ts
 * RS256 JWT sign and verify helpers.
 *
 * Keys are stored as base64-encoded PEM in environment variables:
 *   JWT_PRIVATE_KEY  — base64(RSA private key PEM, PKCS8)
 *   JWT_PUBLIC_KEY   — base64(RSA public key PEM, SPKI)
 *
 * Generate a keypair once with:
 *   npx tsx scripts/generate-rsa-keys.ts
 * Then paste the output into your .env.
 */

import jwt from 'jsonwebtoken';

// ─────────────────────────────────────────────────────────────
//  Key loading — decoded once per process, not per request
// ─────────────────────────────────────────────────────────────

function loadPem(envVar: string): string {
  const b64 = process.env[envVar];
  if (!b64) {
    throw new Error(
      `[jwt] ${envVar} is not set.\n` +
      `Run: npx tsx scripts/generate-rsa-keys.ts  and paste the output into .env`,
    );
  }
  return Buffer.from(b64, 'base64').toString('utf8');
}

// Lazy-loaded so the error surfaces at first use, not at module import time.
// This keeps the rest of the app bootable even if JWT keys aren't set yet.
let _privateKey: string | null = null;
let _publicKey: string | null = null;

function getPrivateKey(): string {
  return (_privateKey ??= loadPem('JWT_PRIVATE_KEY'));
}

function getPublicKey(): string {
  return (_publicKey ??= loadPem('JWT_PUBLIC_KEY'));
}

// ─────────────────────────────────────────────────────────────
//  Public API
// ─────────────────────────────────────────────────────────────

export interface AccessTokenPayload {
  sub: string;   // user_id or provider_id (UUID)
  role: string;  // 'customer' | 'provider'
  phone: string; // E.164
}

/**
 * Signs a 15-minute RS256 access token.
 */
export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, getPrivateKey(), {
    algorithm: 'RS256',
    expiresIn: '15m',
    issuer: 'allido',
    audience: 'allido-api',
  });
}

/**
 * Verifies and decodes an RS256 access token.
 * Throws if expired, tampered, or issued by the wrong key.
 */
export function verifyAccessToken(token: string): AccessTokenPayload & jwt.JwtPayload {
  return jwt.verify(token, getPublicKey(), {
    algorithms: ['RS256'],
    issuer: 'allido',
    audience: 'allido-api',
  }) as AccessTokenPayload & jwt.JwtPayload;
}
