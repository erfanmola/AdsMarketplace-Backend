import he from "he";
import type { Insertable } from "kysely";
import { type BotPipeline, leaveChat, NyxResponse } from "nyx-bot-client";
import type { DB } from "../../db";
import { jobCheckBotPermissions } from "../../jobs/check-bot-permissions";
import { jobJoinHelperAdmin } from "../../jobs/join-helper-admin";
import { jobPromoteHelperAdmin } from "../../jobs/promote-helper-admin";
import { jobUpdateChatInfo } from "../../jobs/update-chat-info";
import { jobUpdateChatMembersCount } from "../../jobs/update-chat-members-count";
import { jobUpdateChatStats } from "../../jobs/update-chat-stats";
import type { DBSchema } from "../../schema";
import { getRandomHelperAdminId } from "../../utils/admin";
import { db } from "../../utils/database";
import { events } from "../../utils/events";
import { match } from "../../utils/helpers";
import { t } from "../../utils/i18n";
import { runJobs } from "../../utils/job";
import { createNotification } from "../../utils/notifications";

export const handlerMyChatMemberAdministrator: BotPipeline<
	"my_chat_member",
	DBSchema
> = async (message) => {
	if (message.new_chat_member.status === "administrator") {
		if (!["channel", "supergroup"].includes(message.chat.type)) {
			await leaveChat({
				chat_id: message.chat.id,
			});

			await createNotification({
				title: t("en", "notifications.publishers.flow.add.normalGroup.title"),
				message: t(
					"en",
					"notifications.publishers.flow.add.normalGroup.message",
					{
						name: he.encode(
							message.chat.title ?? message.chat.first_name ?? "",
						),
					},
				),
				user_id: Number(message.from.id),
				haptic: "warning",
			});

			return NyxResponse.Finish;
		}

		const entity = await db
			.selectFrom("entities")
			.select(["id"])
			.where("chat_id", "=", message.chat.id.toString())
			.executeTakeFirst();

		if (entity) {
			await db
				.updateTable("entities")
				.set({
					owner_id: message.from.id,
					name: message.chat.title,
					username: message.chat.username,
					is_bot_admin: true,
					is_active: false,
					is_verified: false,
				})
				.where("chat_id", "=", message.chat.id.toString())
				.execute();

			events.emit("entityUpdated", {
				id: entity.id,
			});

			events.emit("entityUsernameChanged", {
				id: entity.id,
				username: message.chat.username,
			});
		} else {
			const entity: Insertable<DB["entities"]> = {
				owner_id: message.from.id,
				name: message.chat.title!,
				username: message.chat.username,
				chat_id: message.chat.id,
				is_bot_admin: true,
				helper_user_id: getRandomHelperAdminId(),
				type: match(
					message.chat.type,
					[
						["channel", 0],
						["supergroup", 1],
					],
					0,
				),
			};

			await db.insertInto("entities").values(entity).execute();
		}

		const ok = await runJobs(
			{
				chat_id: message.chat.id,
			},
			[
				jobCheckBotPermissions,
				jobUpdateChatInfo,
				jobUpdateChatMembersCount,
				jobJoinHelperAdmin,
				jobPromoteHelperAdmin,
			],
		);

		if (ok) {
			const entity = (await db
				.selectFrom("entities")
				.select(["id", "name"])
				.where("chat_id", "=", message.chat.id.toString())
				.executeTakeFirst())!;

			await db
				.updateTable("entities")
				.set({
					is_active: true,
				})
				.where("chat_id", "=", message.chat.id.toString())
				.execute();

			events.emit("entityUpdated", {
				id: entity.id,
			});

			await createNotification({
				title: t("en", "notifications.publishers.flow.add.activated.title"),
				message: t(
					"en",
					"notifications.publishers.flow.add.activated.message",
					{ name: entity.name },
				),
				user_id: message.from.id,
				haptic: "success",
			});

			await runJobs(
				{
					chat_id: Number(message.chat.id),
				},
				[jobUpdateChatStats],
			);
		} else {
			await leaveChat({
				chat_id: message.chat.id,
			});
		}

		return NyxResponse.Finish;
	}

	return NyxResponse.Ok;
};
