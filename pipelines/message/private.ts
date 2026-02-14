import { type BotPipeline, NyxResponse } from "nyx-bot-client";
import type { DBSchema } from "../../schema";
import { handlerMessagePrivateCommands } from "./private/commands";
import { handlerMessagePrivateDefault } from "./private/default";
import { handlerMessagePrivateFlood } from "./private/flood";
import { handlerMessagePrivateStates } from "./private/state";
import { handlerMessageTopics } from "./private/topic";
import { handlerMessagePrivateUser } from "./private/user";

const pipelines: BotPipeline<"message", DBSchema>[] = [
	handlerMessagePrivateFlood,
	handlerMessagePrivateUser,
	handlerMessageTopics,
	handlerMessagePrivateCommands,
	handlerMessagePrivateStates,
	handlerMessagePrivateDefault,
];

export const handlerMessagePrivate: BotPipeline<"message", DBSchema> = async (
	message,
	injections,
) => {
	if (message.chat.type === "private") {
		for (const handler of pipelines) {
			const result = await handler(message, injections);

			if (result === NyxResponse.Finish) {
				return NyxResponse.Finish;
			}
		}
	}

	return NyxResponse.Ok;
};
