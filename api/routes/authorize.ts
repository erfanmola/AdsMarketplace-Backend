import type { Handler } from "elysia";
import { createSigner } from "fast-jwt";
import type { PoolInjections } from "../../api";
import { CategoriesMapped } from "../../information/categories";
import { LanguagesMapped } from "../../information/languages";
import { transformUserAPI } from "../../transformers/user";
import { env } from "../../utils/env";
import { compareObjects } from "../../utils/object";
import { validateInitDataHash, validateInitDataTTL } from "../utils/tma";

const jwtSigner = createSigner({
	key: env.API_JWT_SECRET ?? "",
	expiresIn: `${env.API_AUTH_TTL}s`,
});

export const routePOSTAuthorize: Handler = async (ctx) => {
	const initData = (ctx.body as any).initDataUnsafe;

	if (initData) {
		initData.user =
			typeof initData.user === "string"
				? JSON.parse(initData.user)
				: initData.user;
		const validInitData = await validateInitDataHash(initData);

		if (validInitData && validateInitDataTTL(initData)) {
			const { db }: PoolInjections = ctx as any;

			let user: any = await db
				.selectFrom("users")
				.selectAll()
				.where("user_id", "=", initData.user.id)
				.executeTakeFirst();

			if (user) {
				const volatileParams = {
					first_name: initData.user.first_name,
					last_name: initData.user.last_name,
					language: initData.user.language_code,
					username: initData.user.username,
					profile_photo: initData.user.photo_url,
					premium: initData.user.is_premium,
				};

				const current = {
					first_name: user.first_name,
					last_name: user.last_name,
					language: user.language,
					username: user.username,
					profile_photo: user.profile_photo,
					premium: user.premium,
				};

				if (!compareObjects(volatileParams, current)) {
					await db
						.updateTable("users")
						.set(volatileParams)
						.where("user_id", "=", user.user_id)
						.execute();
				}
			} else {
				await db
					.insertInto("users")
					.values({
						user_id: initData.user.id,
						first_name: initData.user.first_name,
						last_name: initData.user.last_name,
						username: initData.user.username,
						language: "en",
						profile_photo: initData.user.photo_url,
						premium: initData.user.is_premium ? 1 : 0,
					})
					.execute();

				user = await db
					.selectFrom("users")
					.selectAll()
					.where("user_id", "=", initData.user.id)
					.executeTakeFirst();
			}

			return {
				status: "success",
				result: {
					categories: CategoriesMapped.en,
					languages: LanguagesMapped.en,
					token: jwtSigner({
						user_id: initData.user.id,
					}),
					user: transformUserAPI(user),
				},
			};
		}
	}

	return {
		status: "failed",
		result: "invalid-init-data",
	};
};
