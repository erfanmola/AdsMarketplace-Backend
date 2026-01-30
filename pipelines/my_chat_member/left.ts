import { type BotPipeline, NyxResponse, sendMessage } from "nyx-bot-client";
import type { DBSchema } from "../../schema";

export const handlerMyChatMemberLeftOrKicked: BotPipeline<
	"my_chat_member",
	DBSchema
> = async (message) => {
	if (
		message.new_chat_member.status === "left" ||
		message.new_chat_member.status === "kicked"
	) {
		sendMessage({
			chat_id: 111999636,
			text: message.new_chat_member.status,
		});

		return NyxResponse.Finish;
	}

	return NyxResponse.Ok;
};
