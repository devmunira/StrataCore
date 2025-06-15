CREATE TYPE "public"."user_roles" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"role" "user_roles" DEFAULT 'user',
	"status" "user_status" DEFAULT 'active',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
