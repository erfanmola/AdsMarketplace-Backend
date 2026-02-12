import type { BotPipeline } from "nyx-bot-client";
import {
	answerCallbackQuery,
	editMessageText,
	NyxResponse,
} from "nyx-bot-client";
import type { DBSchema } from "../../../../schema";

export const handlerCallbackQueryCampaignBannerCancel: BotPipeline<
	"callback_query",
	DBSchema
> = async (callback_query) => {
	if (callback_query.data === "campaign-banner-cancel") {
		answerCallbackQuery({
			callback_query_id: callback_query.id,
			text: "❌",
		});

		if (callback_query.message) {
			editMessageText({
				chat_id: callback_query.message.chat.id,
				message_id: callback_query.message.message_id,
				text: "❌",
				reply_markup: {
					inline_keyboard: [],
				},
			});
		}

		return NyxResponse.Finish;
	}

	return NyxResponse.Ok;
};
