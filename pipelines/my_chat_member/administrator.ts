import type { Insertable } from "kysely";
import { type BotPipeline, NyxResponse } from "nyx-bot-client";
import type { DB } from "../../db";
import { jobCheckBotPermissions } from "../../jobs/check-bot-permissions";
import { jobUpdateChatInfo } from "../../jobs/update-chat-info";
import { jobUpdateChatMembersCount } from "../../jobs/update-chat-members-count";
import type { DBSchema } from "../../schema";
import { getRandomHelperAdminId } from "../../utils/admin";
import { db } from "../../utils/database";
import { events } from "../../utils/events";
import { runJobs } from "../../utils/job";

export const handlerMyChatMemberAdministrator: BotPipeline<
	"my_chat_member",
	DBSchema
> = async (message) => {
	if (message.new_chat_member.status === "administrator") {
		const entity = await db
			.selectFrom("entities")
			.selectAll()
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

			events.emit("entityIsBotAdminChanged", {
				id: entity.id,
				old: entity.is_bot_admin,
				new: false,
			});

			events.emit("entityIsActiveChanged", {
				id: entity.id,
				old: entity.is_active,
				new: false,
			});

			events.emit("entityIsVerifiedChanged", {
				id: entity.id,
				old: entity.is_verified,
				new: false,
			});
		} else {
			const entity: Insertable<DB["entities"]> = {
				owner_id: message.from.id,
				name: message.chat.title!,
				username: message.chat.username,
				chat_id: message.chat.id,
				is_bot_admin: true,
				helper_user_id: getRandomHelperAdminId(),
			};

			await db.insertInto("entities").values(entity).execute();
		}

		const ok = await runJobs(
			{
				chat_id: message.chat.id,
			},
			[jobCheckBotPermissions, jobUpdateChatInfo, jobUpdateChatMembersCount],
		);

		if (ok) {
			// TODO: activate channel and ready for request
		}

		return NyxResponse.Finish;
	}

	return NyxResponse.Ok;
};
