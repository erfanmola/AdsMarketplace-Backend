import { type BotPipeline, NyxResponse } from "nyx-bot-client";
import type { DBSchema } from "../../../../schema";
import { setState } from "../../../../utils/state";

export const handlerPrivateCommandStart: BotPipeline<
	"message",
	DBSchema
> = async (message) => {
	if (message.text?.startsWith("/start")) {
		setState(message.chat.id, "private", {});
	}

	return NyxResponse.Ok;
};
