/**
 * generate-rsa-keys.ts
 * One-time script to generate an RSA-2048 keypair for JWT RS256 signing.
 *
 * Run once:
 *   npx tsx scripts/generate-rsa-keys.ts
 *
 * Then paste the two output lines into your .env file.
 * The private key is used to SIGN tokens (server-side only).
 * The public key is used to VERIFY tokens (can be shared with other services).
 *
 * ⚠️  Keep JWT_PRIVATE_KEY secret. Never commit it to git.
 *     Add .env to .gitignore if you haven't already.
 */

import { generateKeyPairSync } from 'crypto';

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding:  { type: 'spki',  format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const privateKeyB64 = Buffer.from(privateKey).toString('base64');
const publicKeyB64  = Buffer.from(publicKey).toString('base64');

console.log('\n# ─────────────────────────────────────────────────────────');
console.log('# Paste these two lines into your .env file');
console.log('# NEVER commit JWT_PRIVATE_KEY to version control');
console.log('# ─────────────────────────────────────────────────────────\n');
console.log(`JWT_PRIVATE_KEY=${privateKeyB64}`);
console.log(`JWT_PUBLIC_KEY=${publicKeyB64}`);
console.log('\n# ─────────────────────────────────────────────────────────\n');
