import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>) {
	await sql`
    CREATE TABLE public.verification_requests (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

      entity_id uuid NOT NULL,
      user_id bigint NOT NULL,

      status smallint NOT NULL DEFAULT 0, -- 0=pending, 1=accepted, -1=rejected
      admin_note text,

      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    -- One active request per entity at a time
    CREATE UNIQUE INDEX verification_requests_unique_pending
      ON public.verification_requests (entity_id)
      WHERE status = 0;

    -- Indexes
    CREATE INDEX verification_requests_user_idx ON public.verification_requests (user_id);
    CREATE INDEX verification_requests_status_idx ON public.verification_requests (status);
    CREATE INDEX verification_requests_created_idx ON public.verification_requests (created_at DESC);

    -- FKs
    ALTER TABLE public.verification_requests
      ADD CONSTRAINT verification_requests_entity_fk
      FOREIGN KEY (entity_id)
      REFERENCES public.entities(id)
      ON DELETE CASCADE;

    ALTER TABLE public.verification_requests
      ADD CONSTRAINT verification_requests_user_fk
      FOREIGN KEY (user_id)
      REFERENCES public.users(user_id)
      ON DELETE CASCADE;

    -- Auto-update updated_at
    CREATE OR REPLACE FUNCTION set_verification_requests_updated_at()
    RETURNS trigger AS $$
    BEGIN
      IF row(NEW.*) IS DISTINCT FROM row(OLD.*) THEN
        NEW.updated_at = now();
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_verification_requests_updated
    BEFORE UPDATE ON public.verification_requests
    FOR EACH ROW EXECUTE FUNCTION set_verification_requests_updated_at();
  `.execute(db);
}

export async function down(db: Kysely<any>) {
	await sql`
    DROP TABLE IF EXISTS public.verification_requests CASCADE;
    DROP FUNCTION IF EXISTS set_verification_requests_updated_at;
  `.execute(db);
}
