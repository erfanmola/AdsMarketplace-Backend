import { setWebhook } from "nyx-bot-client";
import { env } from "../utils/env";

export const initializeWebhook = async () => {
	return setWebhook({
		url: env.WEBHOOK_URL,
		bot_api_server: env.BOT_API_SERVER,
		bot_token: env.BOT_TOKEN,
		secret_token: env.WEBHOOK_SECRET,
		allowed_updates: [
			"update_id",
			"message",
			"edited_message",
			"channel_post",
			"edited_channel_post",
			"business_connection",
			"business_message",
			"edited_business_message",
			"deleted_business_messages",
			"message_reaction",
			"message_reaction_count",
			"inline_query",
			"chosen_inline_result",
			"callback_query",
			"shipping_query",
			"pre_checkout_query",
			"purchased_paid_media",
			"poll",
			"poll_answer",
			"my_chat_member",
			"chat_member",
			"chat_join_request",
			"chat_boost",
			"removed_chat_boost",
		],
	});
};

console.log(await initializeWebhook());
