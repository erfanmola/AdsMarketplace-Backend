import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>) {
	await sql`
    CREATE TABLE public.transactions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

      user_id bigint NOT NULL,

      -- Can be positive or negative
      amount numeric(18, 8) NOT NULL,

      description text,

      from_address text,

      payload jsonb,

      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    -- Indexes
    CREATE INDEX transactions_user_id_idx ON public.transactions (user_id);
    CREATE INDEX transactions_created_at_idx
      ON public.transactions (created_at DESC);

    -- Foreign key (Telegram user_id)
    ALTER TABLE public.transactions
      ADD CONSTRAINT transactions_user_fk
      FOREIGN KEY (user_id)
      REFERENCES public.users(user_id)
      ON DELETE CASCADE;

    -- Auto-update updated_at
    CREATE OR REPLACE FUNCTION set_transactions_updated_at()
    RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_transactions_updated
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION set_transactions_updated_at();
  `.execute(db);
}

export async function down(db: Kysely<any>) {
	await sql`
      DROP TABLE IF EXISTS public.transactions CASCADE;
      DROP FUNCTION IF EXISTS set_transactions_updated_at;
   `.execute(db);
}
