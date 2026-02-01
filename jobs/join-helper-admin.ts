import he from "he";
import { leaveChat } from "nyx-bot-client";
import { Api } from "telegram";
import { db } from "../utils/database";
import { env } from "../utils/env";
import { getClient } from "../utils/gramjs";
import { t } from "../utils/i18n";
import { type Job, JobResult } from "../utils/job";
import { createNotification } from "../utils/notifications";

export const jobJoinHelperAdmin: Job<{
	chat_id: number;
}> = async (params: { chat_id: number }) => {
	const entity = await db
		.selectFrom("entities")
		.select(["id", "chat_id", "helper_user_id", "owner_id", "name", "username"])
		.where("chat_id", "=", params.chat_id.toString())
		.executeTakeFirst();

	if (!entity) return JobResult.Failed;

	const client = await getClient(Number(entity.helper_user_id));
	if (!client) return JobResult.Failed;

	try {
		await client.invoke(
			new Api.channels.JoinChannel({
				channel: await client.getEntity(entity.username ?? ""),
			}),
		);

		return JobResult.Ok;
	} catch (err: any) {
		if (err?.errorMessage === "USER_ALREADY_PARTICIPANT") {
			return JobResult.Ok;
		}
	}

	await leaveChat({
		chat_id: entity.chat_id,
		bot_api_server: env.BOT_API_SERVER,
		bot_token: env.BOT_TOKEN,
	});

	await createNotification({
		title: t(
			"en",
			"notifications.publishers.flow.add.unableToJoinHelper.title",
		),
		message: t(
			"en",
			"notifications.publishers.flow.add.unableToJoinHelper.message",
			{
				name: he.encode(entity.name),
			},
		),
		user_id: Number(entity.owner_id),
		haptic: "error",
	});

	return JobResult.Failed;
};
