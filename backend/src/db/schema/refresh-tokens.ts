/**
 * refresh-tokens.ts
 * Drizzle schema for the `refresh_tokens` table.
 *
 * Stores hashed refresh tokens for JWT rotation.
 * Raw token values NEVER touch the DB — only sha256 hashes are stored.
 *
 * Revoked tokens stay in the table (revoked_at is set) so we have an
 * audit trail. A background job can purge rows older than 90 days.
 */

import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    /**
     * ID of the user or provider who owns this token.
     * No FK constraint — could point at users or providers depending on role.
     */
    user_id: uuid('user_id').notNull(),

    /** 'customer' | 'provider' — tells us which table user_id references */
    role: varchar('role', { length: 20 }).notNull(),

    /**
     * sha256(rawToken) in hex. The raw token is returned to the client
     * and never stored here.
     */
    token_hash: varchar('token_hash', { length: 64 }).notNull().unique(),

    /** When this refresh token expires (30 days from issuance) */
    expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),

    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),

    /**
     * Set when the token is revoked (either by rotation or explicit logout).
     * NULL means the token is still valid (assuming not expired).
     */
    revoked_at: timestamp('revoked_at', { withTimezone: true }),
  },
  (table) => ({
    /** Fast lookup during token rotation */
    tokenHashIdx: index('refresh_tokens_hash_idx').on(table.token_hash),

    /** Find all tokens for a user (e.g., logout-all-devices) */
    userIdIdx: index('refresh_tokens_user_id_idx').on(table.user_id),
  }),
);

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
