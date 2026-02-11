export const PostsPerPage = {
	entities: {
		owned: 10,
	},
};

export const Limits = {
	campaigns: {
		name: {
			minLength: 3,
			maxLength: 24,
		},
	},
	adType: {
		price: {
			perHour: {
				min: 0.01,
				max: 1_000,
			},
		},
	},
};
