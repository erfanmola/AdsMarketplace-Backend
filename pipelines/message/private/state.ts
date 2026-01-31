import { type BotPipeline, NyxResponse } from "nyx-bot-client";
import type { DBSchema } from "../../../schema";

const pipelines: BotPipeline<"message", DBSchema>[] = [];

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
