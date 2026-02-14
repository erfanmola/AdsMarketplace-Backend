import { sleep } from "bun";
import { Api } from "telegram";
import { db } from "../utils/database";
import { getClient } from "../utils/gramjs";
import { logger } from "../utils/logger";
import { offerReject } from "../utils/offers";

export const handleCheckScheduledAds = async () => {
	const schedules = await db
		.selectFrom("schedules")
		.selectAll()
		.where("start_at", "<=", new Date())
		.where("status", "=", 1)
		.execute();

	for (const schedule of schedules) {
		const rejectDelete = async () => {
			await db.deleteFrom("schedules").where("id", "=", schedule.id).execute();

			offerReject(schedule.offer_id);
		};

		if (schedule.type === "channel-post") {
			const offer = await db
				.selectFrom("offers")
				.select(["entity_id"])
				.where("id", "=", schedule.offer_id)
				.executeTakeFirst();

			if (offer) {
				const entity = await db
					.selectFrom("entities")
					.select(["username", "helper_user_id"])
					.where("id", "=", offer.entity_id)
					.executeTakeFirst();

				if (entity) {
					const client = await getClient(Number(entity.helper_user_id));

					if (client) {
						try {
							const result = await client.invoke(
								new Api.channels.GetMessages({
									channel: await client.getEntity(entity.username!),
									id: [
										new Api.InputMessageID({
											id: Number(schedule.sent_message_id),
										}),
									],
								}),
							);

							if (
								!(
									result instanceof Api.messages.ChannelMessages &&
									result.messages.filter((i) => i.className === "Message")
										.length > 0
								)
							) {
								await rejectDelete();
							}
						} catch (e) {
							logger.error("Message Check", e as Error);
							await rejectDelete();
						}
					} else {
						await rejectDelete();
					}
				} else {
					await rejectDelete();
				}
			} else {
				await rejectDelete();
			}
		}

		await sleep(1_000);
	}
};
