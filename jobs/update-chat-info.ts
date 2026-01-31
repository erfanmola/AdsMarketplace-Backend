import { getChat } from "nyx-bot-client";
import { db } from "../utils/database";
import { env } from "../utils/env";
import { events } from "../utils/events";
import { type Job, JobResult } from "../utils/job";

export const jobUpdateChatInfo: Job<{
	chat_id: number;
}> = async (params: { chat_id: number }) => {
	const entity = await db
		.selectFrom("entities")
		.select(["id", "chat_id", "owner_id"])
		.where("chat_id", "=", params.chat_id.toString())
		.executeTakeFirst();

	if (!entity) return JobResult.Failed;

	const chat = await getChat({
		chat_id: params.chat_id,
		bot_api_server: env.BOT_API_SERVER,
		bot_token: env.BOT_TOKEN,
	});

	if (
		chat.ok &&
		["channel", "supergroup", "group"].includes(chat.result.type)
	) {
		await db
			.updateTable("entities")
			.set({
				name: chat.result.title,
				username: chat.result.username,
			})
			.where("id", "=", entity.id)
			.execute();

		events.emit("entityUpdated", { id: entity.id });

		events.emit("entityNameChanged", {
			id: entity.id,
			name: chat.result.title!,
		});

		events.emit("entityUsernameChanged", {
			id: entity.id,
			username: chat.result.username,
		});
	}

	return JobResult.Ok;
};
