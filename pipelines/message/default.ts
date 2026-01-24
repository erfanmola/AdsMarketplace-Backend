import { type BotPipeline, NyxResponse, sendAnimation } from "nyx-bot-client";
import { media } from "../../information/media";
import type { DBSchema } from "../../schema";
import { t } from "../../utils/i18n";

export const handlerMessageDefault: BotPipeline<"message", DBSchema> = async (
	message,
) => {
	sendAnimation({
		chat_id: message.chat!.id!,
		animation: media.welcome.banner.file_id!,
		caption: t("en", "general.greet", {
			name: message.from!.first_name,
		}),
	});

	return NyxResponse.Ok;
};
