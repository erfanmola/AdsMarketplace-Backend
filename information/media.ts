import { resolve } from "node:path";
import { sendAnimation } from "nyx-bot-client";
import { cache } from "../utils/cache";
import { env } from "../utils/env";

export const media = {
	welcome: {
		banner: {
			file_id: await cache(
				"media.welcome.banner.gif",
				async () => {
					const result = await sendAnimation({
						animation: `file://${resolve(
							`${__dirname}/../storage/assets/Banner-1080p.mp4`,
						)}`,
						chat_id: env.BOT_ADMIN_ID!,
						bot_api_server: env.BOT_API_SERVER,
						bot_token: env.BOT_TOKEN,
					});

					if (result.ok) {
						return result.result.animation!.file_id;
					}

					return undefined;
				},
				1e10,
			),
		},
	},
};
