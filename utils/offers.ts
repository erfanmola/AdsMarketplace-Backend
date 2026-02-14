import { sleep } from "bun";
import { sendMessage } from "nyx-bot-client";
import { jobCheckBotPermissions } from "../jobs/check-bot-permissions";
import { createTransaction } from "./balance";
import { db } from "./database";
import { env } from "./env";
import { t } from "./i18n";
import { JobResult } from "./job";

export const offerReject = async (id: string, expire = false) => {
	const offer = await db
		.selectFrom("offers")
		.selectAll()
		.where("id", "=", id)
		.where("status", ">", -1)
		.executeTakeFirst();

	if (!offer) return;

	await db
		.updateTable("offers")
		.set({
			status: expire ? -2 : -1,
		})
		.where("id", "=", id)
		.execute();

	await sendMessage({
		chat_id: offer.from_id.toString(),
		message_thread_id: Number(offer.topic_in),
		text: t("en", "offers.entities.messages.rejected"),
		bot_api_server: env.BOT_API_SERVER,
		bot_token: env.BOT_TOKEN,
	});

	await sendMessage({
		chat_id: offer.to_id.toString(),
		message_thread_id: Number(offer.topic_out),
		text: t("en", "offers.entities.messages.rejected"),
		bot_api_server: env.BOT_API_SERVER,
		bot_token: env.BOT_TOKEN,
	});

	await sleep(250);

	// await closeForumTopic({
	// 	chat_id: offer.from_id.toString(),
	// 	message_thread_id: Number(offer.topic_in),
	// 	bot_api_server: env.BOT_API_SERVER,
	// 	bot_token: env.BOT_TOKEN,
	// });

	// await closeForumTopic({
	// 	chat_id: offer.to_id.toString(),
	// 	message_thread_id: Number(offer.topic_out),
	// 	bot_api_server: env.BOT_API_SERVER,
	// 	bot_token: env.BOT_TOKEN,
	// });

	// await sleep(250);

	await db
		.deleteFrom("transactions")
		.where("id", "=", offer.transaction_out)
		.execute();

	await createTransaction({
		amount: offer.price,
		user_id: offer.from_id,
		description: `refund-${offer.id}`,
	});
};

export const offerAccept = async (id: string) => {
	const offer = await db
		.selectFrom("offers")
		.selectAll()
		.where("id", "=", id)
		.where("status", "=", 0)
		.executeTakeFirst();

	if (!offer) return;

	const entity = await db
		.selectFrom("entities")
		.select(["chat_id"])
		.where("id", "=", offer.entity_id)
		.executeTakeFirst();

	if (!entity) return;

	const campaign = await db
		.selectFrom("campaigns")
		.select(["message_id"])
		.where("id", "=", offer.campaign_id)
		.executeTakeFirst();

	if (!campaign) return;

	if (
		(await jobCheckBotPermissions({
			chat_id: Number(entity.chat_id),
		})) !== JobResult.Ok
	) {
		return;
	}

	const dateFormatted = offer.start_at
		.toISOString()
		.slice(0, 16)
		.replace("T", " ");

	await sendMessage({
		chat_id: offer.from_id.toString(),
		message_thread_id: Number(offer.topic_in),
		text: t("en", "offers.entities.messages.accepted", {
			date: dateFormatted,
			duration: t("en", "offers.entities.formatters.duration", {
				hour: (offer.duration / 3600).toString(),
			}),
		}),
		bot_api_server: env.BOT_API_SERVER,
		bot_token: env.BOT_TOKEN,
	});

	await sendMessage({
		chat_id: offer.to_id.toString(),
		message_thread_id: Number(offer.topic_out),
		text: t("en", "offers.entities.messages.accepted", {
			date: dateFormatted,
			duration: t("en", "offers.entities.formatters.duration", {
				hour: (offer.duration / 3600).toString(),
			}),
		}),
		bot_api_server: env.BOT_API_SERVER,
		bot_token: env.BOT_TOKEN,
	});

	await sleep(250);

	// await closeForumTopic({
	// 	chat_id: offer.from_id.toString(),
	// 	message_thread_id: Number(offer.topic_in),
	// 	bot_api_server: env.BOT_API_SERVER,
	// 	bot_token: env.BOT_TOKEN,
	// });

	// await closeForumTopic({
	// 	chat_id: offer.to_id.toString(),
	// 	message_thread_id: Number(offer.topic_out),
	// 	bot_api_server: env.BOT_API_SERVER,
	// 	bot_token: env.BOT_TOKEN,
	// });

	// await sleep(250);

	await db
		.insertInto("schedules")
		.values({
			chat_id: entity.chat_id,
			duration: offer.duration,
			message_id: campaign.message_id!,
			offer_id: offer.id,
			start_at: offer.start_at,
			type: offer.type,
		})
		.execute();

	await db
		.updateTable("offers")
		.set({
			status: 1,
		})
		.where("id", "=", offer.id)
		.execute();
};
