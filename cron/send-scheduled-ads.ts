import { sleep } from "bun";
import { copyMessage, sendMessage } from "nyx-bot-client";
import { ExclusiveChats } from "../information/chats";
import { MESSAGE_EFFECTS } from "../information/effect";
import { db } from "../utils/database";
import { env } from "../utils/env";
import { t } from "../utils/i18n";
import { offerReject } from "../utils/offers";

export const handleSendScheduledAds = async () => {
	const schedules = await db
		.selectFrom("schedules")
		.selectAll()
		.where("start_at", "<=", new Date())
		.where("status", "=", 0)
		.execute();

	for (const schedule of schedules) {
		if (schedule.type === "channel-post") {
			const result = await copyMessage({
				chat_id: schedule.chat_id,
				from_chat_id: ExclusiveChats.archive,
				message_id: Number(schedule.message_id),
				bot_api_server: env.BOT_API_SERVER,
				bot_token: env.BOT_TOKEN,
			});

			if (result.ok) {
				await db
					.updateTable("schedules")
					.set({
						status: 1,
						sent_message_id: result.result.message_id,
					})
					.where("id", "=", schedule.id)
					.execute();

				const offer = await db
					.selectFrom("offers")
					.select(["from_id", "to_id", "topic_in", "topic_out", "entity_id"])
					.where("id", "=", schedule.offer_id)
					.executeTakeFirst();

				if (offer) {
					const entity = await db
						.selectFrom("entities")
						.select(["username"])
						.where("id", "=", offer.entity_id)
						.executeTakeFirst();

					if (entity) {
						await sendMessage({
							chat_id: offer.from_id,
							message_thread_id: Number(offer.topic_in),
							text: t(
								"en",
								"offers.entities.messages.success.channel-post.text",
							),
							reply_markup: {
								inline_keyboard: [
									[
										{
											text: t(
												"en",
												"offers.entities.messages.success.channel-post.buttons.view",
											),
											url: `https://t.me/${entity.username}/${result.result.message_id}`,
											style: "primary",
										},
									],
								],
							},
							message_effect_id: MESSAGE_EFFECTS.confetti,
							bot_token: env.BOT_TOKEN,
							bot_api_server: env.BOT_API_SERVER,
						});

						await sendMessage({
							chat_id: offer.to_id,
							message_thread_id: Number(offer.topic_out),
							text: t(
								"en",
								"offers.entities.messages.success.channel-post.text",
							),
							reply_markup: {
								inline_keyboard: [
									[
										{
											text: t(
												"en",
												"offers.entities.messages.success.channel-post.buttons.view",
											),
											url: `https://t.me/${entity.username}/${result.result.message_id}`,
											style: "primary",
										},
									],
								],
							},
							message_effect_id: MESSAGE_EFFECTS.confetti,
							bot_token: env.BOT_TOKEN,
							bot_api_server: env.BOT_API_SERVER,
						});
					}
				}
			} else {
				await db
					.deleteFrom("schedules")
					.where("id", "=", schedule.id)
					.execute();

				offerReject(schedule.offer_id);
			}
		}

		await sleep(250);
	}
};
