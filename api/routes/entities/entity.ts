import type { Handler } from "elysia";
import type { JWTInjections, PoolInjections } from "../../../api";
import {
	transformEntityAPI,
	transformEntityOwnerAPI,
} from "../../../transformers/entities";
import { db } from "../../../utils/database";

export const routeGETEntity: Handler = async (ctx) => {
	const { user_id }: JWTInjections & PoolInjections = ctx as any;

	const entity = await db
		.selectFrom("entities")
		.selectAll()
		.where("id", "=", ctx.params.id ?? "")
		.executeTakeFirst();

	if (entity) {
		const isOwner = Number(entity?.owner_id) === Number(user_id);

		return {
			status: "success",
			result: {
				entity: isOwner
					? transformEntityOwnerAPI(entity as any)
					: transformEntityAPI(entity as any),
			},
		};
	}

	return {
		status: "failed",
		result: {
			error: "Entity not found",
		},
	};
};
