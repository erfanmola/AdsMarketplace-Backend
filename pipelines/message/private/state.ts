import { type BotPipeline, NyxResponse } from "nyx-bot-client";
import type { DBSchema } from "../../../schema";
import { handlerPrivateStateCampaignBanner } from "./state/campaign-banner";

const pipelines: BotPipeline<"message", DBSchema>[] = [
	handlerPrivateStateCampaignBanner,
];

export const handlerMessagePrivateStates: BotPipeline<
	"message",
	DBSchema
> = async (message, injections) => {
	for (const handler of pipelines) {
		const result = await handler(message, injections);

		if (result === NyxResponse.Finish) {
			return NyxResponse.Finish;
		}
	}

	return NyxResponse.Ok;
};
