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
	name: z
		.string()
		.min(Limits.campaigns.name.minLength)
		.max(Limits.campaigns.name.maxLength),
	description: z
		.string()
		.min(Limits.campaigns.description.minLength)
		.max(Limits.campaigns.description.maxLength)
		.optional(),
});

export const routePOSTCampaignsCreate: Handler = async (ctx) => {
	const { user_id }: JWTInjections & PoolInjections = ctx as any;
	const params = ctx.body as any;

	const { success, data } = schema.safeParse(params);

	if (success) {
		if (data.category === "none") {
			data.category = null as any;
		}

		if (data.language_code === "none") {
			data.language_code = null as any;
		}

		const query = await db
			.insertInto("campaigns")
			.values({
				category: data.category,
				language_code: data.language_code,
				name: data.name,
				description: data.description,
				owner_id: user_id,
			})
			.returning("id")
			.execute();

		return {
			status: "success",
			result: { id: query[0]?.id },
		};
	}

	return {
		status: "failed",
		result: {
			error: "Error creating campaign",
		},
	};
};
