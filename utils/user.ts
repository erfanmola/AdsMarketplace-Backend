import type { User } from "nyx-bot-client";

export const userFullname = (user: User) => {
	return [user.first_name, user.last_name].filter(Boolean).join(" ");
};
