import { RedisClient } from "bun";
import { env } from "./env";

type UserState = {
	state?: string;
	params?: any;
};

export const getState = async (
	user_id: number,
	context: string,
	redis?: RedisClient,
): Promise<UserState> => {
	const connection = redis ?? new RedisClient();
	if (!redis) {
		await connection.connect();
	}

	const data = await connection.get(
		`${env.BOT_USERNAME}-state-${context}-${user_id}`,
	);

	if (data) {
		try {
			return JSON.parse(data);
		} catch (_) {}
	}

	return {
		state: undefined,
		params: undefined,
	};
};

export const setState = async (
	user_id: number,
	context: string,
	state?: UserState,
	redis?: RedisClient,
) => {
	const connection = redis ?? new RedisClient();
	if (!redis) {
		await connection.connect();
	}

	await connection.set(
		`${env.BOT_USERNAME}-state-${context}-${user_id}`,
		JSON.stringify(state ?? {}),
	);
};
