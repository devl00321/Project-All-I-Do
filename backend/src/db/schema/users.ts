/**
 * users.ts
 * Drizzle schema for the `users` table.
 *
 * These are CUSTOMERS of the AlliDo marketplace.
 * Providers live in a separate table (providers.ts).
 *
 * OTPs are NOT stored here — they live in Redis.
 */

import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),

    phone: varchar('phone', { length: 20 })
      .notNull()
      .unique(),

    phone_verified_at: timestamp('phone_verified_at', {
      withTimezone: true,
    }),
    name: varchar('name', { length: 255 }),

    
    email: varchar('email', { length: 320 }).unique(),

    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** Row update timestamp — update manually in application layer */
    updated_at: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    phoneIdx: uniqueIndex('users_phone_unique_idx').on(table.phone),
  }),
);
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
