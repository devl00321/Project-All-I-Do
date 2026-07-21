/**
 * redis.ts
 * ioredis singleton client.
 *
 * Reads connection from REDIS_URL env var.
 * Supports:
 *   - Local Docker:   redis://localhost:6379
 *   - Upstash TLS:    rediss://:<password>@<host>:6380
 *
 * Import this module wherever Redis is needed:
 *   import { redis } from '../lib/redis'
 */

import Redis from 'ioredis';

const url = process.env.REDIS_URL;

if (!url) {
  throw new Error(
    '[redis] REDIS_URL environment variable is not set.\n' +
    'Set it to redis://localhost:6379 for local Docker, or your Upstash URL.',
  );
}

export const redis = new Redis(url, {
  /**
   * ioredis will automatically retry on connection failure.
   * maxRetriesPerRequest=3 means a single command gives up after 3 retries
   * instead of retrying forever — keeps response times predictable.
   */
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
});

redis.on('connect', () => {
  console.log('[redis] Connected ✓');
});

redis.on('error', (err) => {
  console.error('[redis] Connection error:', err.message);
});
