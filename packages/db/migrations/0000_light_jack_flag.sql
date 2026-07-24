CREATE TYPE "public"."animal_status" AS ENUM('rescued', 'intake', 'medical', 'foster', 'adoption_ready', 'adopted');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."species" AS ENUM('dog', 'cat', 'bird', 'rabbit', 'reptile', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('shelter_staff', 'foster_volunteer', 'adopter', 'admin');--> statement-breakpoint
CREATE TABLE "adoptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"animal_id" uuid NOT NULL,
	"adopter_id" uuid NOT NULL,
	"application_date" timestamp with time zone DEFAULT now() NOT NULL,
	"approval_date" timestamp with time zone,
	"match_score" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "animal_medical_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"animal_id" uuid NOT NULL,
	"vaccines" jsonb DEFAULT '[]'::jsonb,
	"medications" jsonb DEFAULT '[]'::jsonb,
	"conditions" text[],
	"next_checkup" timestamp with time zone,
	"notes" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "animal_timeline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"animal_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"description" text NOT NULL,
	"event_date" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "animals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"animal_id" text NOT NULL,
	"name" text,
	"species" "species" DEFAULT 'other' NOT NULL,
	"breed" text,
	"age" integer,
	"gender" "gender" DEFAULT 'unknown',
	"weight" numeric(5, 2),
	"found_location" text,
	"rescue_date" timestamp with time zone,
	"intake_date" timestamp with time zone,
	"status" "animal_status" DEFAULT 'rescued' NOT NULL,
	"description" text,
	"personality" text,
	"photos" jsonb DEFAULT '[]'::jsonb,
	"videos" jsonb DEFAULT '[]'::jsonb,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "animals_animal_id_unique" UNIQUE("animal_id")
);
--> statement-breakpoint
CREATE TABLE "fosters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"animal_id" uuid NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"status" text DEFAULT 'active',
	"match_score" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"full_name" text NOT NULL,
	"phone" text,
	"address" text,
	"avatar_url" jsonb,
	"role" "user_role" DEFAULT 'adopter' NOT NULL,
	"foster_experience" text,
	"availability" text,
	"location" text,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "adoptions" ADD CONSTRAINT "adoptions_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adoptions" ADD CONSTRAINT "adoptions_adopter_id_users_id_fk" FOREIGN KEY ("adopter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animal_medical_records" ADD CONSTRAINT "animal_medical_records_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animal_medical_records" ADD CONSTRAINT "animal_medical_records_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animal_timeline" ADD CONSTRAINT "animal_timeline_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animal_timeline" ADD CONSTRAINT "animal_timeline_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animals" ADD CONSTRAINT "animals_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fosters" ADD CONSTRAINT "fosters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fosters" ADD CONSTRAINT "fosters_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "adoptions_animal_idx" ON "adoptions" USING btree ("animal_id");--> statement-breakpoint
CREATE INDEX "medical_animal_idx" ON "animal_medical_records" USING btree ("animal_id");--> statement-breakpoint
CREATE INDEX "timeline_animal_idx" ON "animal_timeline" USING btree ("animal_id");--> statement-breakpoint
CREATE INDEX "animals_status_idx" ON "animals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "animals_species_idx" ON "animals" USING btree ("species");--> statement-breakpoint
CREATE UNIQUE INDEX "fosters_unique" ON "fosters" USING btree ("user_id","animal_id");--> statement-breakpoint
CREATE INDEX "fosters_animal_idx" ON "fosters" USING btree ("animal_id");--> statement-breakpoint
CREATE INDEX "fosters_user_idx" ON "fosters" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");