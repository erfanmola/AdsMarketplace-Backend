import { RedisClient } from "bun";
import { createPool } from "mysql2";
import { env } from "./env";

export const pools = {
	mysql: createPool({
		host: env.MYSQL_HOST,
		user: env.MYSQL_USER,
		database: env.MYSQL_NAME,
		password: env.MYSQL_PASS,
		connectionLimit: env.POOL_SIZE_MYSQL,
		maxIdle: 1,
		idleTimeout: 60 * 60_000,
	}),
	redis: new RedisClient(),
};
