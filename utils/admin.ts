import { env } from "./env";

export const getRandomHelperAdminId = () => {
	const helperIds = env.HELPER_IDS.split(",").map(Number);
	return helperIds[Math.floor(Math.random() * helperIds.length)];
};

export const getBotSelfID = () => Number(env.BOT_TOKEN.split(":")[0]);
