import type { Handler } from "elysia";
import z from "zod";
import type { JWTInjections, PoolInjections } from "../../../api";
import { Categories } from "../../../information/categories";
import { Languages } from "../../../information/languages";
import { db } from "../../../utils/database";

const schema = z.object({
	category: z.enum(["none", ...Categories]).optional(),
	language_code: z.enum(["none", ...Languages]).optional(),
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
