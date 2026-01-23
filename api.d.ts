import type { RedisClient } from "bun";
import type { Kysely } from "kysely";
import type { Pool } from "mysql2";
import type { DBSchema } from "../../schema";

export type JWTInjections = {
	user_id: number;
};

export type PoolInjections = {
	mysql: Pool;
	redis: RedisClient;
	db: Kysely<DBSchema>;
};
