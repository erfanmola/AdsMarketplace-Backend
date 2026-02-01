import { sleep } from "bun";
import { jobUpdateChatStats } from "../jobs/update-chat-stats";
import { db } from "../utils/database";
import { runJobs } from "../utils/job";

export const handleUpdateStats = async () => {
	const entities = await db
		.selectFrom("entities")
		.select(["id", "chat_id"])
		.where("is_active", "=", true)
		.execute();

	for (const entity of entities) {
		await runJobs(
			{
				chat_id: Number(entity.chat_id),
			},
			[jobUpdateChatStats],
		);

		await sleep(1_000);
	}
};
