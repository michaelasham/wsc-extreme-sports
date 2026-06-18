CREATE TYPE "public"."session_status" AS ENUM('pending', 'confirmed', 'discarded');--> statement-breakpoint
CREATE TABLE "cabins" (
	"id" text PRIMARY KEY NOT NULL,
	"number" integer NOT NULL,
	"name" text NOT NULL,
	"mascot" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cabins_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "campers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"cabin_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" text PRIMARY KEY NOT NULL,
	"rel_path" text NOT NULL,
	"mime" text NOT NULL,
	"width" integer,
	"height" integer,
	"bytes" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rage_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"cabin_id" text NOT NULL,
	"camper_id" text NOT NULL,
	"status" "session_status" DEFAULT 'pending' NOT NULL,
	"before_media_id" text,
	"after_media_id" text,
	"ai_rage_score" real,
	"ai_destruction_level" real,
	"ai_team_energy" real,
	"ai_safety_discipline" real,
	"ai_creativity_bonus" integer,
	"ai_notes" text[],
	"final_rage_score" real,
	"final_destruction_level" real,
	"final_team_energy" real,
	"final_safety_discipline" real,
	"final_creativity_bonus" integer,
	"total_score" integer,
	"previous_rank" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"confirmed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "campers" ADD CONSTRAINT "campers_cabin_id_cabins_id_fk" FOREIGN KEY ("cabin_id") REFERENCES "public"."cabins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rage_sessions" ADD CONSTRAINT "rage_sessions_cabin_id_cabins_id_fk" FOREIGN KEY ("cabin_id") REFERENCES "public"."cabins"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rage_sessions" ADD CONSTRAINT "rage_sessions_camper_id_campers_id_fk" FOREIGN KEY ("camper_id") REFERENCES "public"."campers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rage_sessions" ADD CONSTRAINT "rage_sessions_before_media_id_media_id_fk" FOREIGN KEY ("before_media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rage_sessions" ADD CONSTRAINT "rage_sessions_after_media_id_media_id_fk" FOREIGN KEY ("after_media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;