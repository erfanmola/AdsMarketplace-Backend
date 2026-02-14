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
	name: z
		.string()
		.min(Limits.campaigns.name.minLength)
		.max(Limits.campaigns.name.maxLength)
		.optional(),
	description: z
		.string()
		.min(Limits.campaigns.description.minLength)
		.max(Limits.campaigns.description.maxLength)
		.optional(),
	is_active: z.stringbool().optional(),
});

export const routePOSTCampaignsUpdate: Handler = async (ctx) => {
	const { user_id }: JWTInjections & PoolInjections = ctx as any;
	const params = ctx.body as any;

	const campaign = await db
		.selectFrom("campaigns")
		.select(["id"])
		.where("id", "=", ctx.params.id ?? "")
		.where("owner_id", "=", user_id.toString())
		.executeTakeFirst();

	if (campaign) {
		const { success, data } = schema.safeParse(params);

		if (success) {
			if (data.category === "none") {
				data.category = null as any;
			}

			if (data.language_code === "none") {
				data.language_code = null as any;
			}

			if (
				data.description?.trim().length === 0 ||
				data.description === "none"
			) {
				data.description = null as any;
			}

			const values: Updateable<DB["campaigns"]> = {
				category: data.category,
				language_code: data.language_code,
				name: data.name,
				description: data.description,
				is_active: data.is_active,
			};

			if (Object.values(values).some((value) => value !== undefined)) {
				await db
					.updateTable("campaigns")
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
