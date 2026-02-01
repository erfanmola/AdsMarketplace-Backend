import he from "he";
import { getChatMember, leaveChat } from "nyx-bot-client";
import { db } from "../utils/database";
import { env } from "../utils/env";
import { t } from "../utils/i18n";
import { type Job, JobResult } from "../utils/job";
import { createNotification } from "../utils/notifications";

export const jobCheckHelperPermissions: Job<{
	chat_id: number;
}> = async (params: { chat_id: number }) => {
	const entity = await db
		.selectFrom("entities")
		.select(["id", "chat_id", "owner_id", "name", "helper_user_id"])
		.where("chat_id", "=", params.chat_id.toString())
		.executeTakeFirst();

	if (!entity) return JobResult.Failed;

	const chat_member = await getChatMember({
		user_id: Number(entity.helper_user_id),
		chat_id: params.chat_id,
		bot_api_server: env.BOT_API_SERVER,
		bot_token: env.BOT_TOKEN,
	});

	if (chat_member.ok && chat_member.result.status === "administrator") {
		const { can_post_messages } = chat_member.result;

		if (![can_post_messages].every(Boolean)) {
			await leaveChat({
				chat_id: entity.chat_id,
				bot_api_server: env.BOT_API_SERVER,
				bot_token: env.BOT_TOKEN,
			});

			await createNotification({
				title: t(
					"en",
					"notifications.publishers.flow.add.insufficientHelperPermissions.title",
				),
				message: t(
					"en",
					"notifications.publishers.flow.add.insufficientHelperPermissions.message",
					{ name: he.encode(entity.name) },
				),
				user_id: Number(entity.owner_id),
				haptic: "warning",
			});

			return JobResult.Failed;
		}
	}

	return JobResult.Ok;
};
