import type { DBSchema } from "../schema";

export const transformOwnedCampaignAPI = (
	campaign: Partial<DBSchema["campaigns"]>,
) => {
	const { id, name, category, language_code, message_id } = campaign;

	return {
		id,
		name,
		category,
		language_code,
		is_ready: Boolean(message_id),
	};
};
