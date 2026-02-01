import { sleep } from "bun";
import { leaveChat } from "nyx-bot-client";
import { jobCheckBotPermissions } from "../jobs/check-bot-permissions";
import { jobCheckHelperPermissions } from "../jobs/check-helper-permissions";
import { jobUpdateChatInfo } from "../jobs/update-chat-info";
import { jobUpdateChatMembersCount } from "../jobs/update-chat-members-count";
import { db } from "../utils/database";
import { env } from "../utils/env";
import { runJobs } from "../utils/job";

export const handleCheckJobs = async () => {
	const entities = await db
		.selectFrom("entities")
		.select(["chat_id"])
		.where("is_active", "=", true)
		.execute();

	for (const entity of entities) {
		const ok = await runJobs(
			{
				chat_id: Number(entity.chat_id),
			},
			[
				jobCheckBotPermissions,
				jobCheckHelperPermissions,
				jobUpdateChatInfo,
				jobUpdateChatMembersCount,
			],
		);

		if (!ok) {
			await leaveChat({
				chat_id: entity.chat_id,
				bot_api_server: env.BOT_API_SERVER,
				bot_token: env.BOT_TOKEN,
			});
		}

		await sleep(1_000);
	}
};
