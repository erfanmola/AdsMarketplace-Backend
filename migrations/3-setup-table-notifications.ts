import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>) {
	await sql`
    CREATE TABLE public.notifications (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

      user_id bigint NOT NULL,

      title text NOT NULL,
      message text NOT NULL,

      -- 0 = none, 1 = success, 2 = warning, 3 = error
      haptic smallint NOT NULL DEFAULT 0,

      seen boolean NOT NULL DEFAULT false,

      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    -- Indexes
    CREATE INDEX notifications_user_id_idx ON public.notifications (user_id);
    CREATE INDEX notifications_user_unseen_idx
      ON public.notifications (user_id)
      WHERE seen = false;

    CREATE INDEX notifications_created_at_idx
      ON public.notifications (created_at DESC);

    -- Foreign key (Telegram user_id)
    ALTER TABLE public.notifications
      ADD CONSTRAINT notifications_user_fk
      FOREIGN KEY (user_id)
      REFERENCES public.users(user_id)
      ON DELETE CASCADE;

    -- Auto-update updated_at
    CREATE OR REPLACE FUNCTION set_notifications_updated_at()
    RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_notifications_updated
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION set_notifications_updated_at();
  `.execute(db);
}

export async function down(db: Kysely<any>) {
	await sql`
    DROP TABLE IF EXISTS public.notifications CASCADE;
    DROP FUNCTION IF EXISTS set_notifications_updated_at;
  `.execute(db);
}
