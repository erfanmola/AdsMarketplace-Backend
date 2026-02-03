import type { Handler } from "elysia";
import type { JWTInjections, PoolInjections } from "../../../api";
import { PostsPerPage } from "../../../information/limit";
import { transformOwnedEntityAPI } from "../../../transformers/entities";
import { db } from "../../../utils/database";

export const routeGETEntitiesOwned: Handler = async (ctx) => {
	const { user_id }: JWTInjections & PoolInjections = ctx as any;
	const offset = Number(ctx.params.offset || 0);

	const entities = await db
		.selectFrom("entities")
		.select([
			"id",
			"name",
			"members_count",
			"is_active",
			"is_verified",
			"type",
			"chat_id",
			"username",
		])
		.where("owner_id", "=", user_id.toString())
		.limit(PostsPerPage.entities.owned)
		.offset(offset)
		.orderBy("created_at", "desc")
		.execute();

	return {
		status: "success",
		result: {
			entities: entities.map((item) => transformOwnedEntityAPI(item as any)),
			nextOffset: offset + PostsPerPage.entities.owned,
		},
	};
};
