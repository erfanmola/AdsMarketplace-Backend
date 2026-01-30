import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>) {
	await sql`
    CREATE TABLE public.channels (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

      chat_id bigint NOT NULL UNIQUE,
      username text,
      members_count bigint,
      language_code text,
      owner_id bigint NOT NULL,

      categories jsonb NOT NULL DEFAULT '[]',
      helper_user_id bigint,

      is_bot_admin boolean NOT NULL DEFAULT false,
      is_helper_admin boolean NOT NULL DEFAULT false,
      is_active boolean NOT NULL DEFAULT false,
      is_verified boolean NOT NULL DEFAULT false,

      statistic jsonb NOT NULL DEFAULT '{}',
      price jsonb NOT NULL DEFAULT '{}',

      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    -- Indexes
    CREATE INDEX channels_owner_id_idx ON public.channels (owner_id);
    CREATE INDEX channels_helper_user_id_idx ON public.channels (helper_user_id);
    CREATE INDEX channels_created_at_idx ON public.channels (created_at DESC);
    CREATE INDEX channels_is_active_idx ON public.channels (is_active);
    CREATE INDEX channels_is_verified_idx ON public.channels (is_verified);

    -- JSONB indexes
    CREATE INDEX channels_categories_gin ON public.channels USING GIN (categories);
    CREATE INDEX channels_statistic_gin ON public.channels USING GIN (statistic);
    CREATE INDEX channels_price_gin ON public.channels USING GIN (price);

    -- Foreign key (Telegram user_id)
    ALTER TABLE public.channels
      ADD CONSTRAINT channels_owner_fk
      FOREIGN KEY (owner_id)
      REFERENCES public.users(user_id)
      ON DELETE CASCADE;

    -- Auto-update updated_at
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_channels_updated
    BEFORE UPDATE ON public.channels
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `.execute(db);
}

export async function down(db: Kysely<any>) {
	await sql`
    DROP TABLE IF EXISTS public.channels CASCADE;
    DROP FUNCTION IF EXISTS set_updated_at;
  `.execute(db);
}
