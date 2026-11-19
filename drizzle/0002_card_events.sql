CREATE TABLE "card_events" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "card_events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"client_id" uuid,
	"type" text NOT NULL,
	"coffees_after" smallint NOT NULL,
	"source" text,
	"shop" text,
	"admin_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "card_events_type_values" CHECK ("card_events"."type" in ('added','removed','redeemed','restored','reset'))
);
--> statement-breakpoint
ALTER TABLE "card_events" ADD CONSTRAINT "card_events_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_events" ADD CONSTRAINT "card_events_admin_id_user_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "card_events_created_at_idx" ON "card_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "card_events_shop_created_at_idx" ON "card_events" USING btree ("shop","created_at");