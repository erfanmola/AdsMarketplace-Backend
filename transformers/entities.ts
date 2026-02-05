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
	} = entity;

	const typeString = match(
		Number(type),
		[
			[0, "channel"],
			[1, "supergroup"],
		],
		"channel",
	);

	const transformedStats = match(
		Number(type),
		[
			[0, transformEntityChannelCharts(statistic)],
			[1, undefined],
		],
		undefined,
	);

	return {
		id,
		name,
		members_count: Number(members_count),
		is_active,
		is_verified,
		type: typeString,
		role: "user",
		chat_id,
		username,
		statistic: transformedStats,
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
	};
};

export const transformEntityChannelCharts = (
	stats: DBSchema["entities"]["statistic"] | undefined,
) => {
	if (!(stats as any)?.data) return undefined;

	const statistic = JSON.parse((stats as any).data);
	if (!statistic) return undefined;

	const {
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

	const { period, members, messages, viewers, posters } = statistic as any;

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
