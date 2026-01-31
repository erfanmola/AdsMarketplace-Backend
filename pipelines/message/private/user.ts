import { type BotPipeline, NyxResponse } from "nyx-bot-client";
import type { DBSchema } from "../../../schema";
import { db } from "../../../utils/database";
import { compareObjects } from "../../../utils/object";

export const handlerMessagePrivateUser: BotPipeline<
	"message",
	DBSchema
> = async (message) => {
	if (message.from) {
		const user = await db
			.selectFrom("users")
			.selectAll()
			.where("user_id", "=", message.from.id.toString())
			.executeTakeFirst();

		if (user) {
			const volatileParams = {
				first_name: message.from.first_name,
				language: message.from.language_code,
				last_name: message.from.last_name,
				premium: message.from.is_premium,
				username: message.from.username,
			};

			const current = {
				first_name: user.first_name,
				language: user.language,
				last_name: user.last_name,
				premium: user.premium,
				username: user.username,
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
					first_name: message.from.first_name,
					user_id: message.from.id,
					language: message.from.language_code,
					last_name: message.from.last_name,
					premium: message.from.is_premium,
					username: message.from.username,
				})
				.execute();
		}
	}

	return NyxResponse.Ok;
};
