import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>) {
	await sql`
    CREATE TABLE public.campaigns (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

      name text NOT NULL,
      description text,
      language_code text,
      owner_id bigint NOT NULL,

      category text,

      message_id bigint,

      is_active boolean NOT NULL DEFAULT true,

      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    -- Indexes
    CREATE INDEX campaigns_owner_id_idx ON public.campaigns (owner_id);

    -- Auto-update updated_at
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_campaigns_updated
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `.execute(db);
}

export async function down(db: Kysely<any>) {
	await sql`
    DROP TABLE IF EXISTS public.campaigns CASCADE;
    DROP FUNCTION IF EXISTS set_updated_at;
  `.execute(db);
}
