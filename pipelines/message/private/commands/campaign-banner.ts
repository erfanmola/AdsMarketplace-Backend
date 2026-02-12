import { type BotPipeline, NyxResponse, sendMessage } from "nyx-bot-client";
import type { DBSchema } from "../../../../schema";
import { db } from "../../../../utils/database";
import { t } from "../../../../utils/i18n";
import { setState } from "../../../../utils/state";

export const handlerPrivateCommandCampaignBanner: BotPipeline<
	"message",
	DBSchema
> = async (message) => {
	const match = message.text?.match(
		/^\/start\scampaign-banner-([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/,
	);

	if (match) {
		const campaign = await db
			.selectFrom("campaigns")
			.select(["id", "message_id"])
			.where("id", "=", match[1]!)
			.where("owner_id", "=", message.chat.id.toString())
			.executeTakeFirst();

		if (campaign) {
			if (campaign.message_id) {
				sendMessage({
					chat_id: message.chat.id,
					text: t(
						"en",
						"message.private.commands.campaignBanner.errors.active",
					),
					reply_parameters: {
						message_id: message.message_id,
						allow_sending_without_reply: true,
					},
				});
			} else {
				sendMessage({
					chat_id: message.chat.id,
					text: t("en", "message.private.commands.campaignBanner.text"),
					reply_parameters: {
						message_id: message.message_id,
						allow_sending_without_reply: true,
					},
				});

				setState(message.chat.id, "private", {
					state: "campaign-banner",
					params: {
						id: campaign.id,
					},
				});
			}
		} else {
			sendMessage({
				chat_id: message.chat.id,
				text: t("en", "message.private.commands.campaignBanner.errors.invalid"),
				reply_parameters: {
					message_id: message.message_id,
					allow_sending_without_reply: true,
				},
			});
		}

		return NyxResponse.Finish;
	}

	return NyxResponse.Ok;
};
