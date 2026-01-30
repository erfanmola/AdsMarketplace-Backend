import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>) {
	await sql`
    CREATE TABLE public.channel_requests (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

      channel_id bigint NOT NULL,
      user_id bigint NOT NULL,

      status smallint NOT NULL DEFAULT 0, -- 0=pending, 1=accepted, -1=rejected

      admin_note text,

      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    -- One active request per channel at a time
    CREATE UNIQUE INDEX channel_requests_unique_pending
      ON public.channel_requests (channel_id)
      WHERE status = 0;

    -- Indexes
    CREATE INDEX channel_requests_user_idx ON public.channel_requests (user_id);
    CREATE INDEX channel_requests_status_idx ON public.channel_requests (status);
    CREATE INDEX channel_requests_created_idx ON public.channel_requests (created_at DESC);

    -- FKs
    ALTER TABLE public.channel_requests
      ADD CONSTRAINT channel_requests_channel_fk
      FOREIGN KEY (channel_id)
      REFERENCES public.channels(id)
      ON DELETE CASCADE;

    ALTER TABLE public.channel_requests
      ADD CONSTRAINT channel_requests_user_fk
      FOREIGN KEY (user_id)
      REFERENCES public.users(user_id)
      ON DELETE CASCADE;

    -- Auto-update updated_at
    CREATE OR REPLACE FUNCTION set_channel_requests_updated_at()
    RETURNS trigger AS $$
    BEGIN
      IF row(NEW.*) IS DISTINCT FROM row(OLD.*) THEN
        NEW.updated_at = now();
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_channel_requests_updated
    BEFORE UPDATE ON public.channel_requests
    FOR EACH ROW EXECUTE FUNCTION set_channel_requests_updated_at();
  `.execute(db);
}

export async function down(db: Kysely<any>) {
	await sql`
    DROP TABLE IF EXISTS public.channel_requests CASCADE;
    DROP FUNCTION IF EXISTS set_channel_requests_updated_at;
  `.execute(db);
}
