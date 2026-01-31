import { jobCheckBotPermissions } from "../jobs/check-bot-permissions";
import { jobUpdateChatInfo } from "../jobs/update-chat-info";
import { jobUpdateChatMembersCount } from "../jobs/update-chat-members-count";
import { db } from "../utils/database";
import { runJobs } from "../utils/job";

export const handleCheckJobs = async () => {
	const entities = await db
		.selectFrom("entities")
		.select(["id", "chat_id"])
		.where("is_active", "=", true)
		.execute();

	for (const entity of entities) {
		const ok = await runJobs(
			{
				chat_id: Number(entity.chat_id),
			},
			[jobCheckBotPermissions, jobUpdateChatInfo, jobUpdateChatMembersCount],
		);

		if (!ok) {
			// TODO: Inactivate
		}
	}
};
