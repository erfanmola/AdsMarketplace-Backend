import { sendMessage } from "nyx-bot-client";
import { db } from "./database";
import { env } from "./env";
import { match } from "./helpers";
import { t } from "./i18n";
import { logger } from "./logger";
import { wsSendUser } from "./ws";

type NotificationHaptic = "none" | "success" | "error" | "warning";

type Notification = {
	user_id: number;
	title: string;
	message: string;
	haptic?: NotificationHaptic;
};

export const createNotification = async (notification: Notification) => {
	try {
		await db
			.insertInto("notifications")
			.values({
				user_id: notification.user_id,
				title: notification.title,
				message: notification.message,
				haptic: match(
					notification.haptic,
					[
						["none", 0],
						["success", 1],
						["warning", 2],
						["error", 3],
					],
					0,
				),
			})
			.execute();

		wsSendUser(notification.user_id, {
			type: "notification",
			data: {
				notification: {
					message: notification.message,
					title: notification.title,
					haptic: notification.haptic,
				},
			},
		});

		const result = await sendMessage({
			chat_id: notification.user_id,
			text: t("en", "notifications.structure", {
				title: notification.title,
				message: notification.message,
				emoji: match(
					notification.haptic,
					[
						["none", "🔔"],
						["success", "✅"],
						["warning", "⚠️"],
						["error", "❌"],
					],
					"🔔",
				),
			}),
			parse_mode: "HTML",
			bot_api_server: env.BOT_API_SERVER,
			bot_token: env.BOT_TOKEN,
		});

		return result.ok;
	} catch (error) {
		logger.error("Notification", error as Error);
	}

	return false;
};
