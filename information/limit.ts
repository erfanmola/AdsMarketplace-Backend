export const PostsPerPage = {
	entities: {
		owned: 10,
	},
	campaigns: {
		owned: 10,
	},
};

export const Limits = {
	campaigns: {
		name: {
			minLength: 3,
			maxLength: 32,
		},
		description: {
			minLength: 0,
			maxLength: 256,
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
