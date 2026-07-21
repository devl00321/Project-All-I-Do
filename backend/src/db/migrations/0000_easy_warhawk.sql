CREATE TYPE "public"."kyc_document_type" AS ENUM('aadhaar', 'pan', 'other');--> statement-breakpoint
CREATE TYPE "public"."provider_status" AS ENUM('pending_verification', 'active', 'suspended');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(20) NOT NULL,
	"phone_verified_at" timestamp with time zone,
	"name" varchar(255),
	"email" varchar(320),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "provider_categories" (
	"provider_id" uuid NOT NULL,
	"category_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(20) NOT NULL,
	"phone_verified_at" timestamp with time zone,
	"name" varchar(255),
	"status" "provider_status" DEFAULT 'pending_verification' NOT NULL,
	"kyc_document_type" "kyc_document_type",
	"kyc_document_url" varchar(2048),
	"kyc_verified_by" uuid,
	"kyc_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "providers_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "provider_categories" ADD CONSTRAINT "provider_categories_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_phone_unique_idx" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX "providers_phone_unique_idx" ON "providers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "providers_status_idx" ON "providers" USING btree ("status");