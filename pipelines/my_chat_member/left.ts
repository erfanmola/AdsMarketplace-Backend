import { type BotPipeline, NyxResponse } from "nyx-bot-client";
import { Api } from "telegram";
import type { DBSchema } from "../../schema";
import { db } from "../../utils/database";
import { events } from "../../utils/events";
import { getClient } from "../../utils/gramjs";
import { t } from "../../utils/i18n";
import { createNotification } from "../../utils/notifications";

export const handlerMyChatMemberLeftOrKicked: BotPipeline<
	"my_chat_member",
	DBSchema
> = async (message) => {
	if (
		message.new_chat_member.status === "left" ||
		message.new_chat_member.status === "kicked"
	) {
		const entity = await db
			.selectFrom("entities")
			.select([
				"id",
				"is_active",
				"is_bot_admin",
				"is_helper_admin",
				"is_verified",
				"username",
				"helper_user_id",
				"owner_id",
				"name",
			])
			.where("chat_id", "=", message.chat.id.toString())
			.executeTakeFirst();

		if (entity) {
			await db
				.updateTable("entities")
				.set({
					is_active: false,
					is_bot_admin: false,
					is_helper_admin: false,
					is_verified: false,
				})
				.where("chat_id", "=", message.chat.id.toString())
				.execute();

			events.emit("entityUpdated", {
				id: entity.id,
			});

			const client = await getClient(Number(entity.helper_user_id));
			client?.invoke(
				new Api.channels.LeaveChannel({
					channel: await client.getEntity(entity.username!),
				}),
			);

			await createNotification({
				title: t("en", "notifications.publishers.flow.add.deactivated.title"),
				message: t(
					"en",
					"notifications.publishers.flow.add.deactivated.message",
					{ name: entity.name },
				),
				user_id: Number(entity.owner_id),
				haptic: "error",
			});
		}

		return NyxResponse.Finish;
	}

	return NyxResponse.Ok;
};
