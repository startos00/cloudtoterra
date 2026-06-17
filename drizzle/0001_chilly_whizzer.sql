ALTER TABLE "nodes" ADD COLUMN "model_3d_url" text;--> statement-breakpoint
ALTER TABLE "nodes" ADD COLUMN "featured" boolean DEFAULT false NOT NULL;