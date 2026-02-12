import type { Handler } from "elysia";
import type { JWTInjections, PoolInjections } from "../../../api";
import {
	transformCampaignAPI,
	transformCampaignOwnerAPI,
} from "../../../transformers/campaigns";
import { db } from "../../../utils/database";

export const routeGETCampaign: Handler = async (ctx) => {
	const { user_id }: JWTInjections & PoolInjections = ctx as any;

	const campaign = await db
		.selectFrom("campaigns")
		.selectAll()
		.where("id", "=", ctx.params.id ?? "")
		.executeTakeFirst();

	if (campaign) {
		const isOwner = Number(campaign?.owner_id) === Number(user_id);

		return {
			status: "success",
			result: {
				campaign: isOwner
					? transformCampaignOwnerAPI(campaign as any)
					: transformCampaignAPI(campaign as any),
			},
		};
	}

	return {
		status: "failed",
		data: {
			error: "Campaign not found",
		},
	};
};
