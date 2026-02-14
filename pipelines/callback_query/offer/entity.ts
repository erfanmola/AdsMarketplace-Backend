import type { BotPipeline } from "nyx-bot-client";
import { NyxResponse } from "nyx-bot-client";
import type { DBSchema } from "../../../schema";
import { handlerCallbackQueryOfferEntityAccept } from "./entity/accept";
import { handlerCallbackQueryOfferEntityReject } from "./entity/reject";

const pipelines: BotPipeline<"callback_query", DBSchema>[] = [
	handlerCallbackQueryOfferEntityReject,
	handlerCallbackQueryOfferEntityAccept,
];

export const handlerCallbackQueryOfferEntity: BotPipeline<
	"callback_query",
	DBSchema
> = async (callback_query, injections) => {
	if (callback_query.data?.startsWith("offer-entity-")) {
		for (const handler of pipelines) {
			const result = await handler(callback_query, injections);

			if (result === NyxResponse.Finish) {
				return NyxResponse.Finish;
			}
		}
	}

	return NyxResponse.Ok;
};
