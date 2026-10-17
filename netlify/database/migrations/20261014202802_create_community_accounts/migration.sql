CREATE TYPE "account_status" AS ENUM('pending', 'active');--> statement-breakpoint
CREATE TYPE "developer_role" AS ENUM('Kurucu', 'Admin', 'Moderatör', 'Developer', 'Tasarımcı');--> statement-breakpoint
CREATE TABLE "activations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"profile_id" uuid NOT NULL,
	"code_hash" text NOT NULL UNIQUE,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_limits" (
	"key" text PRIMARY KEY,
	"attempts" integer DEFAULT 1 NOT NULL,
	"resets_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "developers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"role" "developer_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"identity_id" text UNIQUE,
	"username" text NOT NULL UNIQUE,
	"email" text NOT NULL UNIQUE,
	"status" "account_status" DEFAULT 'pending'::"account_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activations" ADD CONSTRAINT "activations_profile_id_profiles_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE;