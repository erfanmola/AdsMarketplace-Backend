import type { DBSchema } from "../schema";

export const transformOwnedCampaignAPI = (
	campaign: Partial<DBSchema["campaigns"]>,
) => {
	const {
		id,
		name,
		category,
		language_code,
		message_id,
		is_active,
		is_verified,
		description,
	} = campaign;

	return {
		id,
		name,
		category,
		language_code,
		description,
		is_ready: Boolean(message_id),
		is_active,
		is_verified,
	};
};

export const transformCampaignAPI = (
	campaign: Partial<DBSchema["campaigns"]>,
) => {
	const {
		id,
		name,
		category,
		language_code,
		message_id,
		is_active,
		is_verified,
		description,
	} = campaign;

	return {
		id,
		name,
		category,
		language_code,
		description,
		role: "viewer",
		is_ready: Boolean(message_id),
		is_active,
		is_verified,
	};
};

export const transformCampaignOwnerAPI = (
	campaign: Partial<DBSchema["campaigns"]>,
) => {
	const {
		id,
		name,
		category,
		language_code,
		message_id,
		is_active,
		is_verified,
		description,
	} = campaign;

	return {
		id,
		name,
		category,
		language_code,
		description,
		role: "owner",
		is_ready: Boolean(message_id),
		is_active,
		is_verified,
	};
};
