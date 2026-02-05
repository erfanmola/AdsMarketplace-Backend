import he from "he";
import { leaveChat, promoteChatMember } from "nyx-bot-client";
import { db } from "../utils/database";
import { env } from "../utils/env";
import { events } from "../utils/events";
import { t } from "../utils/i18n";
import { type Job, JobResult } from "../utils/job";
import { createNotification } from "../utils/notifications";

export const jobPromoteHelperAdmin: Job<{
	chat_id: number;
}> = async (params: { chat_id: number }) => {
	const entity = await db
		.selectFrom("entities")
		.select([
			"id",
			"chat_id",
			"helper_user_id",
			"owner_id",
			"name",
			"type",
			"is_helper_admin",
		])
		.where("chat_id", "=", params.chat_id.toString())
		.executeTakeFirst();

	if (!entity) return JobResult.Failed;

	const result = await promoteChatMember({
		chat_id: entity.chat_id,
		user_id: Number(entity.helper_user_id),
		bot_api_server: env.BOT_API_SERVER,
		bot_token: env.BOT_TOKEN,

		can_post_messages: entity.type === 0 ? true : undefined,
		can_restrict_members: entity.type === 1,
	});

	const ok = result.ok && result.result;

	await db
		.updateTable("entities")
		.set({
			is_helper_admin: ok,
		})
		.where("chat_id", "=", params.chat_id.toString())
		.execute();

	events.emit("entityUpdated", { id: entity.id });

	if (ok) {
		return JobResult.Ok;
	} else {
		await leaveChat({
			chat_id: entity.chat_id,
			bot_api_server: env.BOT_API_SERVER,
			bot_token: env.BOT_TOKEN,
		});

		await createNotification({
			title: t(
				"en",
				"notifications.publishers.flow.add.unableToAdminHelper.title",
			),
			message: t(
				"en",
				"notifications.publishers.flow.add.unableToAdminHelper.message",
				{
					name: he.encode(entity.name),
				},
			),
			user_id: Number(entity.owner_id),
			haptic: "error",
		});
	}

	return JobResult.Failed;
};
