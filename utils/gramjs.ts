import fs from "node:fs/promises";
import { TelegramClient } from "telegram";
import { LogLevel } from "telegram/extensions/Logger";
import { StringSession } from "telegram/sessions";
import { env } from "./env";

const clientPool = new Map<number, TelegramClient>();

export const initializeClients = async () => {
	for (const id of env.HELPER_IDS.split(",")) {
		const session = new StringSession(
			JSON.parse(
				(
					await fs.readFile(`${__dirname}/../sessions/${id}.session`)
				).toString() ?? "",
			),
		);

		const client = new TelegramClient(
			session,
			env.TELEGRAM_API_ID,
			env.TELEGRAM_API_HASH,
			{},
		);

		client.setLogLevel(LogLevel.NONE);

		clientPool.set(Number(id), client);

		await client.start({
			phoneNumber: async () => "",
			phoneCode: async () => "",
			password: async () => "",
			onError: () => {
				clientPool.delete(Number(id));
				client.disconnect();
			},
		});
	}
};

export const getClient = async (id: number) => {
	return clientPool.get(id);
};
