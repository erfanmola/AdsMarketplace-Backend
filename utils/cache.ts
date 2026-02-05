import { RedisClient } from "bun";
import { env } from "./env";

export const cache = async <T>(
	key: string,
	generator: () => T | Promise<T>,
	ttlMillis: number,
	redis?: RedisClient,
): Promise<T> => {
	let client = redis;
	let createdInternally = false;

	if (!client) {
		client = new RedisClient();
		createdInternally = true;

		try {
			await client.connect();
		} catch (err) {
			console.error("Failed to connect to Redis:", err);
			return await generator();
		}
	}

	try {
		const cached = await client.get(`${env.BOT_USERNAME}-${key}`);
		if (cached !== null) {
			try {
				return JSON.parse(cached) as T;
			} catch {
				// continue to regenerate on parse error
			}
		}

		const value = await generator();

		try {
			if (value !== undefined) {
				await client.set(`${env.BOT_USERNAME}-${key}`, JSON.stringify(value));
				await client.expire(`${env.BOT_USERNAME}-${key}`, ttlMillis / 1_000);
			}
		} catch {
			// ignore set errors
		}

		return value;
	} finally {
		if (createdInternally) {
			client.close();
		}
	}
};
