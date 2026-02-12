import { type BotPipeline, NyxResponse, sendMessage } from "nyx-bot-client";
import type { DBSchema } from "../../../../schema";
import { t } from "../../../../utils/i18n";
import { getState, setState } from "../../../../utils/state";

export const handlerPrivateStateCampaignBanner: BotPipeline<
	"message",
	DBSchema
> = async (message, injections) => {
	const { state } = await getState(message.chat.id, "private");

	if (state === "campaign-banner") {
		for (const handler of pipelines) {
			const result = await handler(message, injections);

			if (result === NyxResponse.Finish) {
				return NyxResponse.Finish;
			}
		}
	}

	return NyxResponse.Ok;
};

const handlerPrivateStateCampaignBannerMessage: BotPipeline<
	"message",
	DBSchema
> = async (message) => {
	const { state, params } = await getState(message.chat.id, "private");

	if (state === "campaign-banner") {
		if (message.text || message.photo || message.video || message.animation) {
			if (message.media_group_id) {
				sendMessage({
					chat_id: message.chat.id,
					text: t(
						"en",
						"message.private.commands.campaignBanner.errors.mediaGroup",
					),
					reply_parameters: {
						message_id: message.message_id,
						allow_sending_without_reply: true,
					},
				});
			} else {
				setState(message.chat.id, "private", {});

				sendMessage({
					chat_id: message.chat.id,
					text: t("en", "message.private.commands.campaignBanner.confirm.text"),
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: t(
										"en",
										"message.private.commands.campaignBanner.confirm.confirm",
									),
									callback_data: `campaign-banner-confirm-${params.id}`,
									style: "success",
								},
								{
									text: t(
										"en",
										"message.private.commands.campaignBanner.confirm.cancel",
									),
									callback_data: "campaign-banner-cancel",
									style: "danger",
								},
							],
						],
					},
					reply_parameters: {
						message_id: message.message_id,
						allow_sending_without_reply: true,
					},
				});
			}
		} else {
			sendMessage({
				chat_id: message.chat.id,
				text: t(
					"en",
					"message.private.commands.campaignBanner.errors.invalidType",
				),
				reply_parameters: {
					message_id: message.message_id,
					allow_sending_without_reply: true,
				},
			});
		}
	}

	return NyxResponse.Finish;
};

const pipelines: BotPipeline<"message", DBSchema>[] = [
	handlerPrivateStateCampaignBannerMessage,
];
