import he from "he";
import { leaveChat } from "nyx-bot-client";
import { db } from "../utils/database";
import { env } from "../utils/env";
import { t } from "../utils/i18n";
import { createNotification } from "../utils/notifications";

export const onEntityCreated = async (data: { id: string }) => {};

export const onEntityUpdated = async (data: { id: string }) => {};

export const onEntityDeleted = async (data: { id: string }) => {};

export const onEntityMembersCountChanged = async (data: {
	id: string;
	members_count: number;
}) => {
	const entity = await db
		.selectFrom("entities")
		.select(["chat_id", "owner_id", "name"])
		.where("id", "=", data.id)
		.executeTakeFirst();
	if (!entity) return;

	if (data.members_count < env.MIN_MEMBERS_COUNT) {
		await leaveChat({
			chat_id: entity.chat_id,
			bot_api_server: env.BOT_API_SERVER,
			bot_token: env.BOT_TOKEN,
		});

		await createNotification({
			title: t(
				"en",
				"notifications.publishers.flow.add.insufficientMembersCount.title",
			),
			message: t(
				"en",
				"notifications.publishers.flow.add.insufficientMembersCount.message",
				{
					members: env.MIN_MEMBERS_COUNT.toLocaleString(),
					name: he.encode(entity.name),
				},
			),
			user_id: Number(entity.owner_id),
			haptic: "warning",
		});
	}
};

export const onEntityUsernameChanged = async (data: {
	id: string;
	username?: string;
}) => {
	const entity = await db
		.selectFrom("entities")
		.select(["chat_id", "owner_id", "name"])
		.where("id", "=", data.id)
		.executeTakeFirst();
	if (!entity) return;

	if (!data.username) {
		leaveChat({
			chat_id: entity.chat_id,
			bot_api_server: env.BOT_API_SERVER,
			bot_token: env.BOT_TOKEN,
		});

		createNotification({
			title: t("en", "notifications.publishers.flow.add.notPublic.title"),
			message: t("en", "notifications.publishers.flow.add.notPublic.message", {
				name: he.encode(entity.name),
			}),
			user_id: Number(entity.owner_id),
			haptic: "warning",
		});
	}
};
