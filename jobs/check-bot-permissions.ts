import he from "he";
import { getChatMember, leaveChat } from "nyx-bot-client";
import { getBotSelfID } from "../utils/admin";
import { db } from "../utils/database";
import { env } from "../utils/env";
import { match } from "../utils/helpers";
import { t } from "../utils/i18n";
import { type Job, JobResult } from "../utils/job";
import { createNotification } from "../utils/notifications";

export const jobCheckBotPermissions: Job<{
	chat_id: number;
}> = async (params: { chat_id: number }) => {
	const entity = await db
		.selectFrom("entities")
		.select(["id", "chat_id", "owner_id", "name", "type"])
		.where("chat_id", "=", params.chat_id.toString())
		.executeTakeFirst();

	if (!entity) return JobResult.Failed;

	const chat_member = await getChatMember({
		user_id: getBotSelfID(),
		chat_id: params.chat_id,
		bot_api_server: env.BOT_API_SERVER,
		bot_token: env.BOT_TOKEN,
	});

	if (chat_member.ok && chat_member.result.status === "administrator") {
		const {
			can_post_messages,
			can_delete_messages,
			can_edit_messages,
			can_promote_members,
			can_pin_messages,
			can_restrict_members,
		} = chat_member.result;

		const channelOk = [
			can_post_messages,
			can_delete_messages,
			can_edit_messages,
			can_promote_members,
		].every(Boolean);

		const groupOk = [
			can_delete_messages,
			can_promote_members,
			can_pin_messages,
			can_restrict_members,
		].every(Boolean);

		const ok = match(
			entity.type,
			[
				[0, channelOk],
				[1, groupOk],
			],
			channelOk,
		);

		if (!ok) {
			await leaveChat({
				chat_id: entity.chat_id,
				bot_api_server: env.BOT_API_SERVER,
				bot_token: env.BOT_TOKEN,
			});

			if (entity.type === 0) {
				await createNotification({
					title: t(
						"en",
						"notifications.publishers.flow.add.insufficientPermissionsChannel.title",
					),
					message: t(
						"en",
						"notifications.publishers.flow.add.insufficientPermissionsChannel.message",
						{ name: he.encode(entity.name) },
					),
					user_id: Number(entity.owner_id),
					haptic: "warning",
				});
			} else if (entity.type === 1) {
				await createNotification({
					title: t(
						"en",
						"notifications.publishers.flow.add.insufficientPermissionsChannel.title",
					),
					message: t(
						"en",
						"notifications.publishers.flow.add.insufficientPermissionsChannel.message",
						{ name: he.encode(entity.name) },
					),
					user_id: Number(entity.owner_id),
					haptic: "warning",
				});
			}

			return JobResult.Failed;
		}
	}

	return JobResult.Ok;
};
