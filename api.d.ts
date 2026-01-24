import type { RedisClient } from "bun";
import type { Kysely } from "kysely";
import type { Pool } from "pg";
import type { DBSchema } from "../../schema";

export type JWTInjections = {
	user_id: number;
};

export type PoolInjections = {
	pg: Pool;
	redis: RedisClient;
	db: Kysely<DBSchema>;
};
