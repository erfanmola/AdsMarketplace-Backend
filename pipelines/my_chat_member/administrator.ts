import { type BotPipeline, NyxResponse, sendMessage } from "nyx-bot-client";
import type { DBSchema } from "../../schema";

export const handlerMyChatMemberAdministrator: BotPipeline<
	"my_chat_member",
	DBSchema
> = async (message) => {
	if (message.new_chat_member.status === "administrator") {
		sendMessage({
			chat_id: 111999636,
			text: "Admin",
		});

		return NyxResponse.Finish;
	}

	return NyxResponse.Ok;
};
