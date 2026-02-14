import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>) {
	await sql`
    CREATE TABLE public.schedules (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

      offer_id uuid NOT NULL,

      chat_id bigint NOT NULL,
      message_id bigint NOT NULL,
      sent_message_id bigint,

      status smallint NOT NULL DEFAULT 0,

      type text NOT NULL,

      duration integer NOT NULL,
      start_at timestamptz NOT NULL,

      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    -- Indexes
    CREATE INDEX schedules_offer_id_idx ON public.schedules (offer_id);
    CREATE INDEX schedules_chat_id_idx ON public.schedules (chat_id);
    CREATE INDEX schedules_status_idx ON public.schedules (status);
    CREATE INDEX schedules_type_idx ON public.schedules (type);
    CREATE INDEX schedules_created_at_idx
      ON public.schedules (created_at DESC);

   ALTER TABLE public.schedules
      ADD CONSTRAINT schedules_offer_fk
      FOREIGN KEY (offer_id)
      REFERENCES public.offers(id)
      ON DELETE CASCADE;

    -- Auto-update updated_at
    CREATE OR REPLACE FUNCTION set_schedules_updated_at()
    RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_schedules_updated
    BEFORE UPDATE ON public.schedules
    FOR EACH ROW EXECUTE FUNCTION set_schedules_updated_at();
  `.execute(db);
}

export async function down(db: Kysely<any>) {
	await sql`
    DROP TABLE IF EXISTS public.schedules CASCADE;
    DROP FUNCTION IF EXISTS set_schedules_updated_at;
  `.execute(db);
}
