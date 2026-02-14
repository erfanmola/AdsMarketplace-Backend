import type { BotPipeline, Message } from "nyx-bot-client";
import {
	answerCallbackQuery,
	copyMessage,
	editMessageText,
	NyxResponse,
} from "nyx-bot-client";
import { ExclusiveChats } from "../../../../information/chats";
import { miniAppInternalURL } from "../../../../information/general";
import type { DBSchema } from "../../../../schema";
import { db } from "../../../../utils/database";
import { t } from "../../../../utils/i18n";

export const handlerCallbackQueryCampaignBannerConfirm: BotPipeline<
	"callback_query",
	DBSchema
> = async (callback_query) => {
	if (callback_query.data?.startsWith("campaign-banner-confirm-")) {
		const campaignId = callback_query.data.replace(
			"campaign-banner-confirm-",
			"",
		);

		const campaign = await db
			.selectFrom("campaigns")
			.select(["id"])
			.where("id", "=", campaignId)
			.where("owner_id", "=", callback_query.from.id.toString())
			.executeTakeFirst();

		if (campaign) {
			answerCallbackQuery({
				callback_query_id: callback_query.id,
				text: "✅",
			});

			if (callback_query.message) {
				copyMessage({
					chat_id: ExclusiveChats.archive,
					from_chat_id: callback_query.message.chat.id,
					message_id: (callback_query.message as Message).reply_to_message!
						.message_id,
				}).then(async (result) => {
					if (!result.ok) return;

					await db
						.updateTable("campaigns")
						.set({
							message_id: result.result.message_id,
						})
						.where("id", "=", campaignId)
						.where("owner_id", "=", callback_query.from.id.toString())
						.executeTakeFirst();

					editMessageText({
						chat_id: callback_query.message!.chat.id,
						message_id: callback_query.message!.message_id,
						text: t(
							"en",
							"message.private.commands.campaignBanner.success.text",
						),
						reply_markup: {
							inline_keyboard: [
								[
									{
										text: t(
											"en",
											"message.private.commands.campaignBanner.success.button",
										),
										url: `${miniAppInternalURL}?startapp=campaign-${campaign.id}`,
										style: "primary",
									},
								],
							],
						},
					});
				});
			}

			return NyxResponse.Finish;
		}
	}

	return NyxResponse.Ok;
};
