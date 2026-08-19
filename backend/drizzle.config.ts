/**
 * Configuration for Drizzle Kit CLI (migrations, studio, introspection).
 *
 * Commands:
 *   npx drizzle-kit generate   — generate migration SQL from schema diff
 *   npx drizzle-kit migrate    — apply pending migrations to the DB
 *   npx drizzle-kit studio     — open Drizzle Studio (visual DB browser)
 *   npx drizzle-kit push       — push schema directly (dev only, no history)
 */

import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  throw new Error(
    '[drizzle.config] DATABASE_URL is not set. Copy .env.example → .env',
  );
}

export default defineConfig({
  schema: './src/db/schema/index.ts',

  out: './src/db/migrations',

  dialect: 'postgresql',

  dbCredentials: {
    url: process.env.DATABASE_URL,
  },

  verbose: true,

  
  strict: true,
});
