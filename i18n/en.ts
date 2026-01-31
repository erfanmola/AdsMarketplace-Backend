const dictionary = {
	general: {
		greet: "Hello {name}!",
		flood: "Due to spam, we are unable to respond to your request.",
	},
	notifications: {
		structure: "{emoji} <b>{title}</b>\n\n{message}",
		publishers: {
			flow: {
				add: {
					insufficientPermissions: {
						title: "Insufficient Permissions",
						message:
							"Please add the bot to the chat <b>{name}</b> as an administrator with following permissions:\n\n- Post Message\n- Edit Message\n- Delete Message\n- Promote Members",
					},
					notPublic: {
						title: "Inaccessible Chat",
						message:
							"The chat <b>{name}</b> is not public. Please make the chat public and try again.",
					},
					insufficientMembersCount: {
						title: "Insufficient Members",
						message:
							"The chat <b>{name}</b> does not have enough members (>= {members}). Please add more members and try again.",
					},
				},
			},
		},
	},
} as const;

export default dictionary;
