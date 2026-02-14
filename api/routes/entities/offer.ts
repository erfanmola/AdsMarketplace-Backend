import { sleep } from "bun";
import type { Handler } from "elysia";
import {
	copyMessage,
	createForumTopic,
	deleteForumTopic,
	sendMessage,
} from "nyx-bot-client";
import { v4 as uuidv4 } from "uuid";
import z from "zod";
import type { JWTInjections, PoolInjections } from "../../../api";
import { ExclusiveChats } from "../../../information/chats";
import { MESSAGE_EFFECTS } from "../../../information/effect";
import { miniAppInternalURL } from "../../../information/general";
import { transformEntityAd } from "../../../transformers/entities";
import { createTransaction, getBalance } from "../../../utils/balance";
import { db } from "../../../utils/database";
import { env } from "../../../utils/env";
import { t } from "../../../utils/i18n";

const schema = z.object({
	campaignId: z.string(),
	date: z.coerce.number(),
	type: z.enum(["channel-post", "channel-story", "group-pin"]),
	duration: z.coerce.number(),
});

export const routePOSTEntitiesOffer: Handler = async (ctx) => {
	const { user_id }: JWTInjections & PoolInjections = ctx as any;
	const params = ctx.body as any;

	const entity = await db
		.selectFrom("entities")
		.select(["id", "owner_id", "name", "ads", "type", "username"])
		.where("id", "=", ctx.params.id ?? "")
		.where("is_active", "=", true)
		.executeTakeFirst();

	if (!entity) {
		return {
			status: "failed",
			result: {
				error: "Entity not found",
			},
		};
	}

	const { success, data } = schema.safeParse(params);

	if (!success) {
		return {
			status: "failed",
			result: {
				error: "Invalid Entity Data",
			},
		};
	}

	const campaign = await db
		.selectFrom("campaigns")
		.select(["id", "message_id"])
		.where("id", "=", data.campaignId)
		.where("owner_id", "=", user_id.toString())
		.where("is_active", "=", true)
		.executeTakeFirst();

	if (!campaign) {
		return {
			status: "failed",
			result: {
				error: "Campaign not found",
			},
		};
	}

	const offers = await db
		.selectFrom("offers")
		.select(["id"])
		.where("campaign_id", "=", campaign.id)
		.where("entity_id", "=", entity.id)
		.where("type", "=", data.type)
		.where("status", "=", 0)
		.execute();

	if (offers.length > 0) {
		return {
			status: "failed",
			result: {
				error: "Similar offer already exists",
			},
		};
	}

	const ads = transformEntityAd(Number(entity.type), entity.ads as any);

	if (!(data.type in ads)) {
		return {
			status: "failed",
			result: {
				error: "Ad Type not found",
			},
		};
	}

	const price =
		Math.trunc(ads[data.type].price.perHour * data.duration * 100) / 100;
	const balance = await getBalance(user_id);

	if (balance < price) {
		return {
			status: "failed",
			result: {
				error: "Insufficient balance",
			},
		};
	}

	const id = uuidv4();
	const short_id = id.split("-")[0];

	const resultTopicIn = await createForumTopic({
		chat_id: user_id,
		name: `Offer ${short_id}`,
		bot_api_server: env.BOT_API_SERVER,
		bot_token: env.BOT_TOKEN,
	});

	const resultTopicOut = await createForumTopic({
		chat_id: entity.owner_id,
		name: `Offer ${short_id}`,
		bot_api_server: env.BOT_API_SERVER,
		bot_token: env.BOT_TOKEN,
	});

	await sleep(250);

	const deleteTopics = () => {
		if (resultTopicIn.ok) {
			deleteForumTopic({
				chat_id: user_id,
				message_thread_id: resultTopicIn.result.message_thread_id,
				bot_api_server: env.BOT_API_SERVER,
				bot_token: env.BOT_TOKEN,
			});
		}

		if (resultTopicOut.ok) {
			deleteForumTopic({
				chat_id: entity.owner_id,
				message_thread_id: resultTopicOut.result.message_thread_id,
				bot_api_server: env.BOT_API_SERVER,
				bot_token: env.BOT_TOKEN,
			});
		}
	};

	if (!(resultTopicIn.ok && resultTopicOut.ok)) {
		deleteTopics();

		return {
			status: "failed",
			result: {
				error: "Unable to create forum topics",
			},
		};
	}

	const transactionIn = await createTransaction({
		user_id: user_id,
		amount: -1 * price,
		payload: {
			offer: id,
		},
	});

	const transactionOut = await createTransaction({
		user_id: entity.owner_id,
		amount: price,
		payload: {
			offer: id,
		},
		pending: 1,
	});

	const bannerIn = await copyMessage({
		chat_id: user_id,
		from_chat_id: ExclusiveChats.archive,
		message_id: Number(campaign.message_id),
		message_thread_id: resultTopicIn.result.message_thread_id,
		bot_api_server: env.BOT_API_SERVER,
		bot_token: env.BOT_TOKEN,
	});

	await sleep(250);

	const bannerOut = await copyMessage({
		chat_id: entity.owner_id,
		from_chat_id: ExclusiveChats.archive,
		message_id: Number(campaign.message_id),
		message_thread_id: resultTopicOut.result.message_thread_id,
		bot_api_server: env.BOT_API_SERVER,
		bot_token: env.BOT_TOKEN,
	});

	if (!(bannerIn.ok && bannerOut.ok)) {
		deleteTopics();

		return {
			status: "failed",
			result: {
				error: "Unable to send banners",
			},
		};
	}

	await sleep(250);

	const dateFormatted = new Date(data.date)
		.toISOString()
		.slice(0, 16)
		.replace("T", " ");

	await sendMessage({
		chat_id: user_id,
		text: t("en", "offers.entities.messages.in.initial", {
			chat: entity.name,
			date: dateFormatted,
			duration: t("en", "offers.entities.formatters.duration", {
				hour: data.duration.toString(),
			}),
			price: price.toLocaleString(),
			type: t("en", `offers.entities.formatters.types.${data.type}`),
			username: entity.username ?? "None",
		}),
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: t("en", "offers.entities.messages.in.buttons.entity"),
						url: `${miniAppInternalURL}?start_app=entity-${entity.id}`,
						style: "primary",
					},
				],
			],
		},
		reply_parameters: {
			message_id: bannerIn.result.message_id,
			allow_sending_without_reply: true,
		},
		message_effect_id: MESSAGE_EFFECTS.confetti,
		message_thread_id: resultTopicIn.result.message_thread_id,
		bot_api_server: env.BOT_API_SERVER,
		bot_token: env.BOT_TOKEN,
	});

	await sleep(250);

	await sendMessage({
		chat_id: entity.owner_id,
		text: t("en", "offers.entities.messages.out.initial", {
			chat: entity.name,
			date: dateFormatted,
			duration: t("en", "offers.entities.formatters.duration", {
				hour: data.duration.toString(),
			}),
			price: price.toLocaleString(),
			type: t("en", `offers.entities.formatters.types.${data.type}`),
			username: entity.username ?? "None",
		}),
		reply_markup: {
			inline_keyboard: [
				[
					{
						text: t("en", "offers.entities.messages.out.buttons.accept"),
						callback_data: `offer-entity-accept-${id}`,
						style: "success",
					},
					{
						text: t("en", "offers.entities.messages.out.buttons.reject"),
						callback_data: `offer-entity-reject-${id}`,
						style: "danger",
					},
				],
			],
		},
		reply_parameters: {
			message_id: bannerOut.result.message_id,
			allow_sending_without_reply: true,
		},
		message_effect_id: MESSAGE_EFFECTS.confetti,
		message_thread_id: resultTopicOut.result.message_thread_id,
		bot_api_server: env.BOT_API_SERVER,
		bot_token: env.BOT_TOKEN,
	});

	await db
		.insertInto("offers")
		.values({
			id: id,
			campaign_id: campaign.id,
			entity_id: entity.id,
			from_id: user_id.toString(),
			to_id: entity.owner_id.toString(),
			price: price.toString(),
			type: data.type,
			duration: data.duration * 3600,
			start_at: new Date(data.date),
			topic_in: resultTopicIn.result.message_thread_id,
			topic_out: resultTopicOut.result.message_thread_id,
			transaction_in: transactionIn,
			transaction_out: transactionOut,
			status: 0,
		})
		.execute();

	return {
		status: "success",
		result: {
			id,
			topicId: resultTopicIn.result.message_thread_id,
		},
	};
};
