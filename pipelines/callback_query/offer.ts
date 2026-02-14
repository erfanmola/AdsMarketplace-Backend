import type { BotPipeline } from "nyx-bot-client";
import { NyxResponse } from "nyx-bot-client";
import type { DBSchema } from "../../schema";
import { handlerCallbackQueryOfferEntity } from "./offer/entity";

const pipelines: BotPipeline<"callback_query", DBSchema>[] = [
	handlerCallbackQueryOfferEntity,
];

export const handlerCallbackQueryOffer: BotPipeline<
	"callback_query",
	DBSchema
> = async (callback_query, injections) => {
	if (callback_query.data?.startsWith("offer-")) {
		for (const handler of pipelines) {
			const result = await handler(callback_query, injections);

			if (result === NyxResponse.Finish) {
				return NyxResponse.Finish;
			}
		}
	}

	return NyxResponse.Ok;
};
