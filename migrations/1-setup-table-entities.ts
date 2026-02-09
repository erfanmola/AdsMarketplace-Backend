import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>) {
	await sql`
    CREATE TABLE public.entities (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      -- 0=channel, 1=supergroup
      type smallint NOT NULL DEFAULT 0,

      chat_id bigint NOT NULL UNIQUE,
      name text NOT NULL,
      username text,
      members_count bigint,
      language_code text,
      owner_id bigint NOT NULL,

      category text,
      helper_user_id bigint,

      is_bot_admin boolean NOT NULL DEFAULT false,
      is_helper_admin boolean NOT NULL DEFAULT false,
      is_active boolean NOT NULL DEFAULT false,
      is_verified boolean NOT NULL DEFAULT false,

      statistic jsonb NOT NULL DEFAULT '{}',
      ads jsonb NOT NULL DEFAULT '{}',

      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    -- Indexes
    CREATE INDEX entities_owner_id_idx ON public.entities (owner_id);
    CREATE INDEX entities_helper_user_id_idx ON public.entities (helper_user_id);
    CREATE INDEX entities_category_idx ON public.entities (category);
    CREATE INDEX entities_created_at_idx ON public.entities (created_at DESC);
    CREATE INDEX entities_is_active_idx ON public.entities (is_active);
    CREATE INDEX entities_is_verified_idx ON public.entities (is_verified);

    -- JSONB indexes
    CREATE INDEX entities_statistic_gin ON public.entities USING GIN (statistic);
    CREATE INDEX entities_ads_gin ON public.entities USING GIN (ads);

    -- Auto-update updated_at
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_entities_updated
    BEFORE UPDATE ON public.entities
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `.execute(db);
}

export async function down(db: Kysely<any>) {
	await sql`
    DROP TABLE IF EXISTS public.entities CASCADE;
    DROP FUNCTION IF EXISTS set_updated_at;
  `.execute(db);
}
