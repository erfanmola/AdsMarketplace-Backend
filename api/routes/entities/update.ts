import type { Handler } from "elysia";
import type { Updateable } from "kysely";
import z from "zod";
import type { JWTInjections, PoolInjections } from "../../../api";
import type { DB } from "../../../db";
import { Categories } from "../../../information/categories";
import { Languages } from "../../../information/languages";
import { Limits } from "../../../information/limit";
import { db } from "../../../utils/database";

const schema = z.object({
	category: z.enum(["none", ...Categories]).optional(),
	language_code: z.enum(["none", ...Languages]).optional(),
	ads: z
		.record(
			z.enum(["channel-post", "channel-story", "group-pin"]),
			z
				.object({
					type: z.enum(["channel-post", "channel-story", "group-pin"]),
					active: z.boolean(),
					period: z.object({
						unit: z.union([
							z.literal(8), // 8 Hours
							z.literal(12), // 12 Hours
							z.literal(24), // 24 Hours
						]),
						max: z.union([
							z.literal(24), // 24 Hours
							z.literal(48), // 48 Hours
							z.literal(72), // 72 Hours
						]),
					}),
					price: z.object({
						perHour: z.coerce
							.number()
							.min(Limits.adType.price.perHour.min)
							.max(Limits.adType.price.perHour.max),
					}),
				})
				.optional(),
		)
		.optional(),
});

export const routePOSTEntityUpdate: Handler = async (ctx) => {
	const { user_id }: JWTInjections & PoolInjections = ctx as any;
	const params = ctx.body as any;

	const entity = await db
		.selectFrom("entities")
		.select(["id"])
		.where("id", "=", ctx.params.id ?? "")
		.where("owner_id", "=", user_id.toString())
		.executeTakeFirst();

	if (entity) {
		const { success, data } = schema.safeParse(params);

		if (success) {
			if (data.category === "none") {
				data.category = null as any;
			}

			if (data.language_code === "none") {
				data.language_code = null as any;
			}

			const values: Updateable<DB["entities"]> = {
				category: data.category,
				language_code: data.language_code,
				ads: data.ads ? JSON.stringify(data.ads) : undefined,
			};

			if (Object.values(values).some((value) => value !== undefined)) {
				await db
					.updateTable("entities")
					.set(values)
					.where("id", "=", ctx.params.id ?? "")
					.where("owner_id", "=", user_id.toString())
					.execute();
			}

			return {
				status: "success",
				result: {},
			};
		} else {
			return {
				status: "failed",
				result: {
					error: "Invalid Entity Data",
				},
			};
		}
	}

	return {
		status: "failed",
		result: {
			error: "Entity not found",
		},
	};
};
