import type { BotPipeline } from "nyx-bot-client";
import { NyxResponse } from "nyx-bot-client";
import type { DBSchema } from "../../schema";
import { handlerCallbackQueryCampaignBanner } from "./campaign/banner";

const pipelines: BotPipeline<"callback_query", DBSchema>[] = [
	handlerCallbackQueryCampaignBanner,
];

export const handlerCallbackQueryCampaign: BotPipeline<
	"callback_query",
	DBSchema
> = async (callback_query, injections) => {
	if (callback_query.data?.startsWith("campaign")) {
		for (const handler of pipelines) {
			const result = await handler(callback_query, injections);

			if (result === NyxResponse.Finish) {
				return NyxResponse.Finish;
			}
		}
	}

	return NyxResponse.Ok;
};
