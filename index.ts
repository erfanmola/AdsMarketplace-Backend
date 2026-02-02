import { sendMessage } from "nyx-bot-client";
import client from "nyx-bot-client/nyx-client";
import { initializeAPI } from "./api/api";
import { handlerCallbackQueryAnalytics } from "./pipelines/callback_query/analytics";
import { handlerCallbackQueryDefault } from "./pipelines/callback_query/default";
import { handlerCallbackQueryFlood } from "./pipelines/callback_query/flood";
import { handlerInlineQueryAnalytics } from "./pipelines/inline_query/analytics";
import { handlerInlineQueryDefault } from "./pipelines/inline_query/default";
import { handlerInlineQueryFlood } from "./pipelines/inline_query/flood";
import { handlerMessageGroups } from "./pipelines/message/group";
import { handlerMessagePrivate } from "./pipelines/message/private";
import { handlerMyChatMemberAdministrator } from "./pipelines/my_chat_member/administrator";
import { handlerMyChatMemberLeftOrKicked } from "./pipelines/my_chat_member/left";
import { updateAnalyticsCounter } from "./utils/analytics";
import { initializeCron } from "./utils/cron";
import { db } from "./utils/database";
import { env } from "./utils/env";
import { initializeClients } from "./utils/gramjs";
import { pools } from "./utils/pool";

client.initialize({
	botConfig: {
		admin_id: env.BOT_ADMIN_ID,
		api: env.BOT_API_SERVER,
		token: env.BOT_TOKEN,
		username: env.BOT_USERNAME,
	},
	pipelines: {
		message: [handlerMessagePrivate, handlerMessageGroups],
		callback_query: [
			handlerCallbackQueryAnalytics,
			handlerCallbackQueryFlood,
			handlerCallbackQueryDefault,
		],
		inline_query: [
			handlerInlineQueryAnalytics,
			handlerInlineQueryFlood,
			handlerInlineQueryDefault,
		],
		my_chat_member: [
			handlerMyChatMemberAdministrator,
			handlerMyChatMemberLeftOrKicked,
		],
	},
	injections: async () => {
		updateAnalyticsCounter("total");

		return {
			injections: {
				db: db,
				pg: pools.pg,
				redis: pools.redis,
			},
			onFinish: async () => {},
		};
	},
	onStartup: async () => {
		if (env.BOT_ADMIN_ID) {
			sendMessage({
				chat_id: env.BOT_ADMIN_ID,
				text: "Bot started",
				disable_notification: true,
			});
		}
	},
	onShutdown: async () => {
		if (env.BOT_ADMIN_ID) {
			await sendMessage({
				chat_id: env.BOT_ADMIN_ID,
				text: "Bot shutdown",
				disable_notification: true,
			});
		}
	},
	redis: {
		host: env.REDIS_HOST,
		port: env.REDIS_PORT,
	},
	benchmark: false,
});

initializeAPI();

initializeCron();

initializeClients();

console.log(`Service started successfully at ${env.API_HOST}:${env.API_PORT}`);
