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
		statistic,
		category,
		language_code,
		ads: ad,
	} = entity;

	const typeString = match(
		Number(type),
		[
			[0, "channel"],
			[1, "supergroup"],
		],
		"channel",
	);

	let transformedStats: any;

	if (Number(type) === 0) {
		transformedStats = transformEntityChannelCharts(statistic);
	} else if (Number(type) === 1) {
		transformedStats = transformEntityGroupCharts(statistic);
	}

	const ads = transformEntityAd(Number(type), ad as any);

	return {
		id,
		name,
		members_count: Number(members_count),
		is_active,
		is_verified,
		type: typeString,
		role: "viewer",
		chat_id,
		username,
		statistic: transformedStats,
		category,
		language_code,
		ads,
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
		statistic,
		category,
		language_code,
		ads: ad,
	} = entity;

	const typeString = match(
		Number(type),
		[
			[0, "channel"],
			[1, "supergroup"],
		],
		"channel",
	);

	let transformedStats: any;

	if (Number(type) === 0) {
		transformedStats = transformEntityChannelCharts(statistic);
	} else if (Number(type) === 1) {
		transformedStats = transformEntityGroupCharts(statistic);
	}

	const ads = transformEntityAd(Number(type), ad as any);

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
		statistic: transformedStats,
		category,
		language_code,
		ads,
	};
};

export const transformEntityChannelCharts = (
	stats: DBSchema["entities"]["statistic"] | undefined,
) => {
	if (!(stats as any)?.data) return undefined;

	const statistic = JSON.parse((stats as any).data);
	if (!statistic) return undefined;

	const {
		boosts,
		period,
		followers,
		viewsPerPost,
		sharesPerPost,
		reactionsPerPost,
		viewsPerStory,
		sharesPerStory,
		enabledNotifications,
	} = statistic as any;

	const graphs = {
		growthGraph: undefined,
		followersGraph: undefined,
		muteGraph: undefined,
		topHoursGraph: undefined,
		interactionsGraph: undefined,
		ivInteractionsGraph: undefined,
		viewsBySourceGraph: undefined,
		newFollowersBySourceGraph: undefined,
		languagesGraph: undefined,
		reactionsByEmotionGraph: undefined,
		storyInteractionsGraph: undefined,
		storyReactionsByEmotionGraph: undefined,
	};

	for (const key in graphs) {
		if (
			(statistic[key as keyof typeof statistic] as any)?.className ===
			"StatsGraph"
		) {
			graphs[key as keyof typeof graphs] =
				(statistic[key as keyof typeof statistic] as any).json?.data ??
				undefined;

			if (typeof graphs[key as keyof typeof graphs] === "string") {
				graphs[key as keyof typeof graphs] = JSON.parse(
					graphs[key as keyof typeof graphs] as any,
				);
			}
		}
	}

	return {
		premiumAudience: {
			part: boosts?.premiumAudience?.part,
			total: boosts?.premiumAudience?.total,
		},
		period: {
			minDate: period.minDate,
			maxDate: period.maxDate,
		},
		followers: {
			current: followers.current,
			previous: followers.previous,
		},
		viewsPerPost: {
			current: viewsPerPost.current,
			previous: viewsPerPost.previous,
		},
		sharesPerPost: {
			current: sharesPerPost.current,
			previous: sharesPerPost.previous,
		},
		reactionsPerPost: {
			current: reactionsPerPost.current,
			previous: reactionsPerPost.previous,
		},
		viewsPerStory: {
			current: viewsPerStory.current,
			previous: viewsPerStory.previous,
		},
		sharesPerStory: {
			current: sharesPerStory.current,
			previous: sharesPerStory.previous,
		},
		enabledNotifications: {
			part: enabledNotifications.part,
			total: enabledNotifications.total,
		},
		...graphs,
	};
};

export const transformEntityGroupCharts = (
	stats: DBSchema["entities"]["statistic"] | undefined,
) => {
	if (!(stats as any)?.data) return undefined;

	const statistic = JSON.parse((stats as any).data);
	if (!statistic) return undefined;

	const { boosts, period, members, messages, viewers, posters } =
		statistic as any;

	const graphs = {
		growthGraph: undefined,
		membersGraph: undefined,
		newMembersBySourceGraph: undefined,
		languagesGraph: undefined,
		messagesGraph: undefined,
		actionsGraph: undefined,
		topHoursGraph: undefined,
		weekdaysGraph: undefined,
	};

	for (const key in graphs) {
		if (
			(statistic[key as keyof typeof statistic] as any)?.className ===
			"StatsGraph"
		) {
			graphs[key as keyof typeof graphs] =
				(statistic[key as keyof typeof statistic] as any).json?.data ??
				undefined;

			if (typeof graphs[key as keyof typeof graphs] === "string") {
				graphs[key as keyof typeof graphs] = JSON.parse(
					graphs[key as keyof typeof graphs] as any,
				);
			}
		}
	}

	return {
		premiumAudience: {
			part: boosts?.premiumAudience?.part,
			total: boosts?.premiumAudience?.total,
		},
		period: {
			minDate: period.minDate,
			maxDate: period.maxDate,
		},
		members: {
			current: members.current,
			previous: members.previous,
		},
		messages: {
			current: messages.current,
			previous: messages.previous,
		},
		viewers: {
			current: viewers.current,
			previous: viewers.previous,
		},
		posters: {
			current: posters.current,
			previous: posters.previous,
		},
		...graphs,
	};
};

export type EntityAd = {
	type: "channel-post" | "channel-story" | "group-pin";
	active: boolean;
	period: {
		unit: number;
		max: number;
	};
	price: {
		perHour: number;
	};
};

export type EntityAds = Record<EntityAd["type"], EntityAd>;

export const transformEntityAd = (
	type: number,
	ads: Partial<EntityAds>,
): EntityAds => {
	if (type === 0) {
		if (!("channel-post" in ads)) {
			ads["channel-post"] = {
				type: "channel-post",
				active: false,
				period: {
					unit: 12,
					max: 48,
				},
				price: {
					perHour: 1,
				},
			};
		}

		if (!("channel-story" in ads)) {
			ads["channel-story"] = {
				type: "channel-story",
				active: false,
				period: {
					unit: 12,
					max: 24,
				},
				price: {
					perHour: 1,
				},
			};
		}
	} else if (type === 1) {
		if (!("group-pin" in ads)) {
			ads["group-pin"] = {
				type: "group-pin",
				active: false,
				period: {
					unit: 12,
					max: 72,
				},
				price: {
					perHour: 1,
				},
			} satisfies EntityAd;
		}
	}

	return ads as EntityAds;
};
