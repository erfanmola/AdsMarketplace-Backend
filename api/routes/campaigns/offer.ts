import type { Handler } from "elysia";
import { sendMessage } from "nyx-bot-client";
import z from "zod";
import type { JWTInjections, PoolInjections } from "../../../api";
import { MESSAGE_EFFECTS } from "../../../information/effect";
import { miniAppInternalURL } from "../../../information/general";
import { db } from "../../../utils/database";
import { t } from "../../../utils/i18n";

const schema = z.object({
	entityId: z.string(),
});

export const routePOSTCampaignsOffer: Handler = async (ctx) => {
	const { user_id }: JWTInjections & PoolInjections = ctx as any;
	const params = ctx.body as any;

	const campaign = await db
		.selectFrom("campaigns")
		.select(["id", "owner_id", "name"])
		.where("id", "=", ctx.params.id ?? "")
		.executeTakeFirst();

	if (campaign) {
		const { success, data } = schema.safeParse(params);

		if (success) {
			const entity = await db
				.selectFrom("entities")
				.select(["id", "name"])
				.where("id", "=", data.entityId)
				.where("owner_id", "=", user_id.toString())
				.executeTakeFirst();

			if (entity) {
				sendMessage({
					chat_id: campaign.owner_id,
					text: t("en", "offers.campaigns.text", {
						campaign_name: campaign.name!,
						chat_name: entity.name!,
					}),
					reply_markup: {
						inline_keyboard: [
							[
								{
									text: t("en", "offers.campaigns.button.view"),
									url: `${miniAppInternalURL}?startapp=entity-${entity.id}`,
									style: "primary",
								},
							],
						],
					},
					message_effect_id: MESSAGE_EFFECTS.confetti,
				});

				return {
					status: "success",
					result: {},
				};
			}
		} else {
			return {
				status: "failed",
				result: {
					error: "Invalid Campaign Data",
				},
			};
		}
	}

	return {
		status: "failed",
		result: {
			error: "Campaign not found",
		},
	};
};
