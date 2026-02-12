import type { Handler } from "elysia";
import type { JWTInjections, PoolInjections } from "../../../api";
import { PostsPerPage } from "../../../information/limit";
import { transformOwnedCampaignAPI } from "../../../transformers/campaigns";
import { db } from "../../../utils/database";

export const routeGETCampaignsOwned: Handler = async (ctx) => {
	const { user_id }: JWTInjections & PoolInjections = ctx as any;
	const offset = Number(ctx.params.offset || 0);

	const campaigns = await db
		.selectFrom("campaigns")
		.select(["id", "category", "language_code", "name", "message_id"])
		.where("owner_id", "=", user_id.toString())
		.limit(PostsPerPage.campaigns.owned)
		.offset(offset)
		.orderBy("created_at", "desc")
		.execute();

	return {
		status: "success",
		result: {
			campaigns: campaigns.map((item) =>
				transformOwnedCampaignAPI(item as any),
			),
			nextOffset: offset + PostsPerPage.campaigns.owned,
		},
	};
};
