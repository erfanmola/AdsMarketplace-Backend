import { sleep } from "bun";
import { closeForumTopic, sendMessage } from "nyx-bot-client";
import { createTransaction } from "./balance";
import { db } from "./database";
import { env } from "./env";
import { t } from "./i18n";

export const offerReject = async (id: string, expire = false) => {
	const offer = await db
		.selectFrom("offers")
		.selectAll()
		.where("id", "=", id)
		.where("status", "=", 0)
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

export const offerAccept = async (id: string) => {};
