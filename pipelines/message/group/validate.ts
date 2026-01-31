import { type BotPipeline, leaveChat, NyxResponse } from "nyx-bot-client";
import type { DBSchema } from "../../../schema";

export const handlerGroupValidate: BotPipeline<"message", DBSchema> = async (
	message,
) => {
	leaveChat({
		chat_id: message.chat.id,
	});

	return NyxResponse.Finish;
};
