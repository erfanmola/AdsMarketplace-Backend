import type { DBSchema } from "../schema";

export const transformUserAPI = (user: DBSchema["users"]) => {
	const { first_name, last_name, language, profile_photo, user_id } = user;

	return {
		first_name,
		last_name,
		language,
		profile_photo,
		user_id,
	};
};
