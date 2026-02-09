import type { Handler } from "elysia";
import z from "zod";
import type { JWTInjections, PoolInjections } from "../../../api";
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
							z.literal(1), // 1 Hour
							z.literal(2), // 2 Hours
							z.literal(3), // 3 Hours
							z.literal(4), // 4 Hours
							z.literal(6), // 6 Hours
							z.literal(8), // 8 Hours
							z.literal(12), // 12 Hours
							z.literal(24), // 24 Hours
						]),
						max: z.union([
							z.literal(24), // 24 Hours
							z.literal(48), // 48 Hours
							z.literal(72), // 72 Hours
							z.literal(96), // 96 Hours
							z.literal(120), // 120 Hours
							z.literal(144), // 144 Hours
							z.literal(168), // 168 Hours
							z.literal(192), // 192 Hours
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

			await db
				.updateTable("entities")
				.set({
					category: data.category,
					language_code: data.language_code,
					ads: data.ads ? JSON.stringify(data.ads) : undefined,
				})
				.where("id", "=", ctx.params.id ?? "")
				.where("owner_id", "=", user_id.toString())
				.execute();

			return {
				status: "success",
				result: {},
			};
		}
	}

	return {
		status: "failed",
		data: {
			error: "Entity not found",
		},
	};
};
