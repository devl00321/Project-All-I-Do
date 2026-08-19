/**
 * Drizzle schema for the `providers` and `provider_categories` tables.
 *
 * Providers are SERVICE WORKERS on the AlliDo marketplace.
 * They share some fields with `users` but have additional KYC /
 * verification fields that customers never need.
 *
 * OTPs are NOT stored here — they live in Redis.
 */

import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

//Enums
export const providerStatusEnum = pgEnum('provider_status', [
  'pending_verification',
  'active',
  'suspended',
]);

/**
 Accepted KYC document types in India.
 */
export const kycDocumentTypeEnum = pgEnum('kyc_document_type', [
  'aadhaar',
  'pan',
  'other',
]);


export const providers = pgTable(
  'providers',
  {
    /** Primary key — auto-generated UUID */
    id: uuid('id')
      .primaryKey()
      .defaultRandom(),

    phone: varchar('phone', { length: 20 })
      .notNull()
      .unique(),

    
     //Null until the provider completes OTP verification.
     //Handled by the OTP auth flow (Redis-backed, not stored here).
    phone_verified_at: timestamp('phone_verified_at', {
      withTimezone: true,
    }),

    /** Display / business name of the provider */
    name: varchar('name', { length: 255 }),

    // ── KYC / Verification ──────────────────────────────────

    /**
     * Approval lifecycle status. Defaults to pending_verification
     * so new providers cannot receive bookings until an admin approves.
     */
    status: providerStatusEnum('status')
      .notNull()
      .default('pending_verification'),

    /**
     * Type of government ID submitted for KYC.
     * Nullable — not yet submitted on initial signup.
     */
    kyc_document_type: kycDocumentTypeEnum('kyc_document_type'),

    /**
     * Signed S3 / object-storage URL pointing to the uploaded KYC document.
     * Nullable until the provider uploads their doc.
     */
    kyc_document_url: varchar('kyc_document_url', { length: 2048 }),

    /**
     * UUID of the admin user who approved/rejected the KYC.
     * No FK constraint for now — admin table will be added later.
     * Nullable until KYC is reviewed.
     */
    kyc_verified_by: uuid('kyc_verified_by'),

    /**
     * Timestamp of KYC approval. Set by the admin review endpoint.
     * Null until an admin acts on this provider's KYC.
     */
    kyc_verified_at: timestamp('kyc_verified_at', {
      withTimezone: true,
    }),

    // ── Timestamps ──────────────────────────────────────────

    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),

    updated_at: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    /** Fast lookup by phone during OTP login */
    phoneIdx: uniqueIndex('providers_phone_unique_idx').on(table.phone),

    /**
     * Non-unique index on status — the most common query pattern is
     * "fetch all active providers" which scans this index.
     */
    statusIdx: index('providers_status_idx').on(table.status),
  }),
);

// ─────────────────────────────────────────────────────────────
//  provider_categories Join Table
//
//  Placeholder join table linking providers → service_categories.
//  The `service_categories` table will be created in a future
//  migration; for now category_id is a bare UUID column.
// ─────────────────────────────────────────────────────────────
export const providerCategories = pgTable(
  'provider_categories',
  {
    /** FK → providers.id */
    provider_id: uuid('provider_id')
      .notNull()
      .references(() => providers.id, { onDelete: 'cascade' }),

    /**
     * FK → service_categories.id (table created in a future migration).
     * Stored as a plain UUID for now; FK constraint will be added
     * when the service_categories table lands.
     */
    category_id: uuid('category_id').notNull(),
  },
  (table) => ({
    /** Composite PK prevents duplicate (provider, category) pairs */
    pk: {
      name: 'provider_categories_pkey',
      columns: [table.provider_id, table.category_id],
    },
  }),
);


export type Provider = typeof providers.$inferSelect;
export type NewProvider = typeof providers.$inferInsert;

export type ProviderCategory = typeof providerCategories.$inferSelect;
export type NewProviderCategory = typeof providerCategories.$inferInsert;

export type ProviderStatus = (typeof providerStatusEnum.enumValues)[number];
export type KycDocumentType = (typeof kycDocumentTypeEnum.enumValues)[number];
