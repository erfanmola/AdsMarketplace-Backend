import { sleep } from "bun";
import { deleteMessage } from "nyx-bot-client";
import { Api } from "telegram";
import { db } from "../utils/database";
import { env } from "../utils/env";
import { getClient } from "../utils/gramjs";
import { t } from "../utils/i18n";
import { logger } from "../utils/logger";
import { createNotification } from "../utils/notifications";
import { offerReject } from "../utils/offers";

export const handleFinishScheduledAds = async () => {
	const schedules = await db
		.selectFrom("schedules")
		.selectAll()
		.where("start_at", "<=", new Date())
		.where("status", "=", 1)
		.execute();

	const now = Date.now();

	const schedulesFinished = schedules.filter((schedule) => {
		if (schedule.start_at.getTime() + schedule.duration * 1000 <= now) {
			return true;
		}

		return false;
	});

	for (const schedule of schedulesFinished) {
		const rejectDelete = async () => {
			await db.deleteFrom("schedules").where("id", "=", schedule.id).execute();

			offerReject(schedule.offer_id);
		};

		if (schedule.type === "channel-post") {
			const offer = await db
				.selectFrom("offers")
				.select(["entity_id", "transaction_out", "price", "to_id"])
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
							} else {
								deleteMessage({
									chat_id: schedule.chat_id,
									message_id: Number(schedule.sent_message_id),
									bot_token: env.BOT_TOKEN,
									bot_api_server: env.BOT_API_SERVER,
								});

								await db
									.updateTable("schedules")
									.set({
										status: 2,
									})
									.where("id", "=", schedule.id)
									.execute();

								await db
									.updateTable("offers")
									.set({
										status: 2,
									})
									.where("id", "=", schedule.offer_id)
									.execute();

								await db
									.updateTable("transactions")
									.set({
										pending: 0,
									})
									.where("id", "=", offer.transaction_out)
									.execute();

								createNotification({
									message: t("en", "notifications.balance.increase.text", {
										amount: (
											Math.trunc(Number(offer.price) * 100) / 100
										).toLocaleString(),
									}),
									title: t("en", "notifications.balance.increase.title"),
									user_id: Number(offer.to_id),
									haptic: "success",
								});
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
