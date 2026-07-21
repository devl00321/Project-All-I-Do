/**
 * client.ts
 * Neon + Drizzle database connection.
 *
 * Uses @neondatabase/serverless with the Drizzle Neon HTTP driver.
 * This works in both serverless (Edge / Lambda) and long-running Node
 * environments — HTTP-based, so no persistent TCP connection needed.
 *
 * Usage:
 *   import { db } from '@/db/client'
 *   const result = await db.select().from(users).where(...)
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    '[db/client] DATABASE_URL environment variable is not set.\n' +
    'Copy .env.example → .env and fill in your Neon connection string.',
  );
}
const sql = neon(connectionString);


export const db = drizzle(sql, { schema });

//   import { db, users } from '@/db/client'
export * from './schema';
