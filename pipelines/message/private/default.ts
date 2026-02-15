import { type BotPipeline, NyxResponse, sendAnimation } from "nyx-bot-client";
import { miniAppInternalURL } from "../../../information/general";
import { media } from "../../../information/media";
import type { DBSchema } from "../../../schema";
import { t } from "../../../utils/i18n";

export const handlerMessagePrivateDefault: BotPipeline<
	"message",
	DBSchema
> = async (message) => {
	sendAnimation({
		chat_id: message.chat!.id!,
		animation: media.welcome.banner.file_id!,
		caption: t("en", "general.greet.text", {
			name: message.from!.first_name,
		}),
		reply_parameters: {
			allow_sending_without_reply: true,
			message_id: message.message_id,
		},
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: t("en", "general.greet.buttons.app"),
						url: miniAppInternalURL,
					},
				],
			],
		},
	});

	return NyxResponse.Ok;
};
