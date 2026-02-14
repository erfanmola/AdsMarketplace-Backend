import {
	type BotPipeline,
	copyMessage,
	NyxResponse,
	sendMessage,
} from "nyx-bot-client";
import type { DBSchema } from "../../../schema";
import { db } from "../../../utils/database";
import { t } from "../../../utils/i18n";

export const handlerMessageTopics: BotPipeline<"message", DBSchema> = async (
	message,
) => {
	if (message.from && message.message_thread_id) {
		const offer = await db
			.selectFrom("offers")
			.select(["id", "from_id", "to_id", "topic_in", "topic_out"])
			.where((eb) => {
				return eb.or([
					eb.and([
						eb("from_id", "=", message.from!.id.toString()),
						eb("topic_in", "=", message.message_thread_id!.toString()),
					]),

					eb.and([
						eb("to_id", "=", message.from!.id.toString()),
						eb("topic_out", "=", message.message_thread_id!.toString()),
					]),
				]);
			})
			.executeTakeFirst();

		if (offer) {
			const target_id =
				Number(offer.from_id) === Number(message.from!.id)
					? Number(offer.to_id)
					: Number(offer.from_id);

			const thread_id =
				Number(offer.from_id) === Number(message.from!.id)
					? Number(offer.topic_out)
					: Number(offer.topic_in);

			copyMessage({
				chat_id: target_id,
				from_chat_id: message.chat.id,
				message_id: message.message_id,
				message_thread_id: thread_id,
			});

			sendMessage({
				chat_id: message.chat.id,
				text: t("en", "offers.entities.messages.sent"),
				message_thread_id: message.message_thread_id,
				reply_parameters: {
					message_id: message.message_id,
					allow_sending_without_reply: true,
				},
			});

			return NyxResponse.Finish;
		}
	}

	return NyxResponse.Ok;
};
