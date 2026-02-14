import type { BotPipeline } from "nyx-bot-client";
import {
	answerCallbackQuery,
	editMessageReplyMarkup,
	NyxResponse,
} from "nyx-bot-client";
import type { DBSchema } from "../../../../schema";
import { db } from "../../../../utils/database";
import { offerAccept } from "../../../../utils/offers";

export const handlerCallbackQueryOfferEntityAccept: BotPipeline<
	"callback_query",
	DBSchema
> = async (callback_query) => {
	if (callback_query.data?.startsWith("offer-entity-accept-")) {
		const id = callback_query.data.replace("offer-entity-accept-", "");

		const offer = await db
			.selectFrom("offers")
			.select(["id"])
			.where("id", "=", id)
			.where("to_id", "=", callback_query.from.id.toString())
			.where("status", "=", 0)
			.executeTakeFirst();

		if (offer) {
			offerAccept(id);

			answerCallbackQuery({
				callback_query_id: callback_query.id,
				text: "✅",
			});

			if (callback_query.message) {
				editMessageReplyMarkup({
					chat_id: callback_query.message.chat.id,
					message_id: callback_query.message.message_id,
					reply_markup: {
						inline_keyboard: [],
					},
				});
			}

			return NyxResponse.Finish;
		}
	}

	return NyxResponse.Ok;
};
