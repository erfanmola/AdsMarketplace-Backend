import type { BotPipeline } from "nyx-bot-client";
import { NyxResponse } from "nyx-bot-client";
import type { DBSchema } from "../../../schema";
import { handlerCallbackQueryCampaignBannerCancel } from "./banner/cancel";
import { handlerCallbackQueryCampaignBannerConfirm } from "./banner/confirm";

const pipelines: BotPipeline<"callback_query", DBSchema>[] = [
	handlerCallbackQueryCampaignBannerCancel,
	handlerCallbackQueryCampaignBannerConfirm,
];

export const handlerCallbackQueryCampaignBanner: BotPipeline<
	"callback_query",
	DBSchema
> = async (callback_query, injections) => {
	if (callback_query.data?.startsWith("campaign-banner")) {
		for (const handler of pipelines) {
			const result = await handler(callback_query, injections);

			if (result === NyxResponse.Finish) {
				return NyxResponse.Finish;
			}
		}
	}

	return NyxResponse.Ok;
};
