CREATE TABLE "hello_messages" (
	"key" text PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"supertokens_user_id" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
