import { getChatMemberCount } from "nyx-bot-client";
import { db } from "../utils/database";
import { env } from "../utils/env";
import { events } from "../utils/events";
import { type Job, JobResult } from "../utils/job";

export const jobUpdateChatMembersCount: Job<{
	chat_id: number;
}> = async (params: { chat_id: number }) => {
	const entity = await db
		.selectFrom("entities")
		.select(["id", "chat_id"])
		.where("chat_id", "=", params.chat_id.toString())
		.executeTakeFirst();

	if (!entity) return JobResult.Failed;

	const chat_members = await getChatMemberCount({
		chat_id: params.chat_id,
		bot_api_server: env.BOT_API_SERVER,
		bot_token: env.BOT_TOKEN,
	});

	if (chat_members.ok) {
		await db
			.updateTable("entities")
			.set({
				members_count: chat_members.result,
			})
			.where("chat_id", "=", params.chat_id.toString())
			.execute();

		events.emit("entityMembersCountChanged", {
			id: entity.id,
			members_count: chat_members.result,
		});
	}

	return JobResult.Ok;
};
