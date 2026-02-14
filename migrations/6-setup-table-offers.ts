import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>) {
	await sql`
    CREATE TABLE public.offers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

      -- who made the offer
      from_id bigint NOT NULL,
      to_id bigint NOT NULL,

      -- channel / entity the offer is for
      entity_id uuid NOT NULL,

      -- campaign offer is for
      campaign_id uuid NOT NULL,

      -- 0 = pending, 1 = accepted, -1 = rejected, 2 = final
      status smallint NOT NULL DEFAULT 0,

      price numeric(38, 18) NOT NULL,

      -- AdType
      type text NOT NULL,

      -- duration in seconds
      duration integer,

      start_at timestamptz,

      transaction_in uuid NOT NULL,
      transaction_out uuid NOT NULL,

      topic_in bigint NOT NULL,
      topic_out bigint NOT NULL,

      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    -- Indexes
    CREATE INDEX offers_from_id_idx ON public.offers (from_id);
    CREATE INDEX offers_to_id_idx ON public.offers (to_id);
    CREATE INDEX offers_entity_id_idx ON public.offers (entity_id);
    CREATE INDEX offers_campaign_id_idx ON public.offers (campaign_id);
    CREATE INDEX offers_transaction_in_idx ON public.offers (transaction_in);
    CREATE INDEX offers_transaction_out_idx ON public.offers (transaction_out);
    CREATE INDEX offers_topic_in_idx ON public.offers (topic_in);
    CREATE INDEX offers_topic_out_idx ON public.offers (topic_out);
    CREATE INDEX offers_status_idx ON public.offers (status);
    CREATE INDEX offers_type_idx ON public.offers (type);
    CREATE INDEX offers_created_at_idx
      ON public.offers (created_at DESC);

    -- Prevent multiple pending offers for same entity from same user
    CREATE UNIQUE INDEX offers_unique_pending
      ON public.offers (from_id, entity_id, type)
      WHERE status = 0;

    -- Foreign keys
    ALTER TABLE public.offers
      ADD CONSTRAINT offers_from_fk
      FOREIGN KEY (from_id)
      REFERENCES public.users(user_id)
      ON DELETE CASCADE;

    ALTER TABLE public.offers
      ADD CONSTRAINT offers_campaign_fk
      FOREIGN KEY (campaign_id)
      REFERENCES public.campaigns(id)
      ON DELETE CASCADE;

   ALTER TABLE public.offers
      ADD CONSTRAINT offers_entity_fk
      FOREIGN KEY (entity_id)
      REFERENCES public.entities(id)
      ON DELETE CASCADE;

    -- Auto-update updated_at
    CREATE OR REPLACE FUNCTION set_offers_updated_at()
    RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_offers_updated
    BEFORE UPDATE ON public.offers
    FOR EACH ROW EXECUTE FUNCTION set_offers_updated_at();
  `.execute(db);
}

export async function down(db: Kysely<any>) {
	await sql`
    DROP TABLE IF EXISTS public.offers CASCADE;
    DROP FUNCTION IF EXISTS set_offers_updated_at;
  `.execute(db);
}
