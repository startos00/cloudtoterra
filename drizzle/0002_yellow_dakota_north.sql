ALTER TABLE "nodes" ADD COLUMN "model_spec" jsonb;--> statement-breakpoint
ALTER TABLE "nodes" ADD COLUMN "model_status" text DEFAULT 'none' NOT NULL;