import type { DBSchema } from "../schema";
import { match } from "../utils/helpers";

export const transformOwnedEntityAPI = (
	entity: Partial<DBSchema["entities"]>,
) => {
	const { id, name, members_count, is_active, is_verified, type, chat_id } =
		entity;

	return {
		id,
		name,
		members_count,
		is_active,
		is_verified,
		type: match(
			Number(type),
			[
				[0, "channel"],
				[1, "supergroup"],
			],
			"channel",
		),
		chat_id,
	};
};
