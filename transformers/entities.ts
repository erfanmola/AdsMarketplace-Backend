import type { DBSchema } from "../schema";
import { match } from "../utils/helpers";

export const transformOwnedEntityAPI = (
	entity: Partial<DBSchema["entities"]>,
) => {
	const {
		id,
		name,
		members_count,
		is_active,
		is_verified,
		type,
		chat_id,
		username,
	} = entity;

	const typeString = match(
		Number(type),
		[
			[0, "channel"],
			[1, "supergroup"],
		],
		"channel",
	);

	return {
		id,
		name,
		members_count: Number(members_count),
		is_active,
		is_verified,
		type: typeString,
		chat_id,
		username,
	};
};

export const transformEntityAPI = (entity: Partial<DBSchema["entities"]>) => {
	const {
		id,
		name,
		members_count,
		is_active,
		is_verified,
		type,
		chat_id,
		username,
	} = entity;

	const typeString = match(
		Number(type),
		[
			[0, "channel"],
			[1, "supergroup"],
		],
		"channel",
	);

	return {
		id,
		name,
		members_count: Number(members_count),
		is_active,
		is_verified,
		type: typeString,
		role: "user",
		chat_id,
		username,
	};
};

export const transformEntityOwnerAPI = (
	entity: Partial<DBSchema["entities"]>,
) => {
	const {
		id,
		name,
		members_count,
		is_active,
		is_verified,
		type,
		chat_id,
		username,
	} = entity;

	const typeString = match(
		Number(type),
		[
			[0, "channel"],
			[1, "supergroup"],
		],
		"channel",
	);

	return {
		id,
		name,
		members_count: Number(members_count),
		is_active,
		is_verified,
		type: typeString,
		role: "owner",
		chat_id,
		username,
	};
};
