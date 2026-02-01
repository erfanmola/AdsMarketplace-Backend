import { type BotPipeline, leaveChat, NyxResponse } from "nyx-bot-client";
import type { DBSchema } from "../../schema";

const pipelines: BotPipeline<"message", DBSchema>[] = [];

export const handlerMessageGroups: BotPipeline<"message", DBSchema> = async (
	message,
	injections,
) => {
	if (message.chat.type === "group") {
		leaveChat({
			chat_id: message.chat.id,
		});

		return NyxResponse.Finish;
	}

	if (message.chat.type === "supergroup") {
		for (const handler of pipelines) {
			const result = await handler(message, injections);

			if (result === NyxResponse.Finish) {
				return NyxResponse.Finish;
			}
		}
	}

	return NyxResponse.Ok;
};
