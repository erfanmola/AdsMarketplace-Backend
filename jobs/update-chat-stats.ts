import { Api } from "telegram";
import { db } from "../utils/database";
import { events } from "../utils/events";
import { getClient } from "../utils/gramjs";
import { type Job, JobResult } from "../utils/job";
import { logger } from "../utils/logger";

export const jobUpdateChatStats: Job<{
	chat_id: number;
}> = async (params: { chat_id: number }) => {
	const entity = await db
		.selectFrom("entities")
		.select(["id", "username", "type", "helper_user_id"])
		.where("chat_id", "=", params.chat_id.toString())
		.executeTakeFirst();

	if (!entity?.username) return JobResult.Failed;

	const client = await getClient(Number(entity.helper_user_id));
	if (!client) return JobResult.Failed;

	try {
		if (entity.type === 0) {
			const channel = await client.invoke(
				new Api.channels.GetFullChannel({
					channel: await client.getEntity(entity.username),
				}),
			);

			const result = await client.invoke(
				new Api.stats.GetBroadcastStats({
					channel: await client.getEntity(entity.username),
					dark: true,
				}),
				(channel.fullChat as any).statsDc ?? undefined,
			);

			const boosts = await client.invoke(
				new Api.premium.GetBoostsStatus({
					peer: await client.getEntity(entity.username),
				}),
			);

			if (boosts) {
				(result as any).boosts = boosts;
			}

			if (result) {
				for (const [key, value] of Object.entries(result)) {
					if (value.className === "StatsGraphAsync") {
						const graph = await client.invoke(
							new Api.stats.LoadAsyncGraph({
								token: value.token,
							}),
							(channel.fullChat as any).statsDc ?? undefined,
						);

						if (graph) {
							// @ts-expect-error
							result[key] = graph;
						}
					}
				}

				await db
					.updateTable("entities")
					.set({
						statistic: {
							updated_at: Date.now(),
							data: JSON.stringify({ ...result }),
						},
					})
					.where("chat_id", "=", params.chat_id.toString())
					.execute();

				events.emit("entityUpdated", { id: entity.id });
			}
		} else if (entity.type === 1) {
			const channel = await client.invoke(
				new Api.channels.GetFullChannel({
					channel: await client.getEntity(entity.username),
				}),
			);

			const result = await client.invoke(
				new Api.stats.GetMegagroupStats({
					channel: await client.getEntity(entity.username),
					dark: true,
				}),
				(channel.fullChat as any).statsDc ?? undefined,
			);

			const boosts = await client.invoke(
				new Api.premium.GetBoostsStatus({
					peer: await client.getEntity(entity.username),
				}),
			);

			if (boosts) {
				(result as any).boosts = boosts;
			}

			if (result) {
				for (const [key, value] of Object.entries(result)) {
					if (value.className === "StatsGraphAsync") {
						const graph = await client.invoke(
							new Api.stats.LoadAsyncGraph({
								token: value.token,
							}),
							(channel.fullChat as any).statsDc ?? undefined,
						);

						if (graph) {
							// @ts-expect-error
							result[key] = graph;
						}
					}
				}

				await db
					.updateTable("entities")
					.set({
						statistic: {
							updated_at: Date.now(),
							data: JSON.stringify({ ...result }),
						},
					})
					.where("chat_id", "=", params.chat_id.toString())
					.execute();

				events.emit("entityUpdated", { id: entity.id });
			}
		}

		return JobResult.Ok;
	} catch (err: any) {
		logger.error(`Entity Stats (${entity.id})`, err);
	}

	return JobResult.Failed;
};
