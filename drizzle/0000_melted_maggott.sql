CREATE TABLE "nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"sub_type" text NOT NULL,
	"condition" text,
	"node_name" text NOT NULL,
	"description" text,
	"photo_urls" text[],
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"boundary" jsonb,
	"country" text,
	"city" text,
	"society_tags" text[],
	"attributes" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"is_visible" boolean DEFAULT false NOT NULL,
	"ip_hash" varchar(64),
	"contributor_email" text,
	"source" text DEFAULT 'crowd',
	"created_at" timestamp with time zone DEFAULT now(),
	"approved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "nodes_type_visible_idx" ON "nodes" USING btree ("type","is_visible");--> statement-breakpoint
CREATE INDEX "nodes_status_idx" ON "nodes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "nodes_ip_idx" ON "nodes" USING btree ("ip_hash","created_at");