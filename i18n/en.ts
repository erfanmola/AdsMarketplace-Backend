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
					normalGroup: {
						title: "Group Not Supported",
						message:
							"The chat <b>{name}</b> is a regular group. Please add the bot to a public channel or a supergroup instead.",
					},

					insufficientPermissionsChannel: {
						title: "Insufficient Permissions",
						message:
							"Please add the bot to <b>{name}</b> as an administrator with the following permissions:\n\n" +
							"- Post messages\n" +
							"- Edit messages\n" +
							"- Delete messages\n" +
							"- Promote members",
					},

					insufficientPermissionsGroup: {
						title: "Insufficient Permissions",
						message:
							"Please add the bot to <b>{name}</b> as an administrator with the following permissions:\n\n" +
							"- Pin messages\n" +
							"- Delete messages\n" +
							"- Restrict members\n" +
							"- Promote members",
					},

					notPublic: {
						title: "Chat Not Public",
						message:
							"The chat <b>{name}</b> is not public. Please make it public and try again.",
					},

					insufficientMembersCount: {
						title: "Not Enough Members",
						message:
							"The chat <b>{name}</b> does not have enough members (minimum: {members}). Please add more members and try again.",
					},

					unableToJoinHelper: {
						title: "Unable to Add Helper User",
						message:
							"We couldn’t add the helper user to <b>{name}</b>. Please make sure the chat is public and joinable, then try again.",
					},

					unableToAdminHelper: {
						title: "Unable to Promote Helper",
						message:
							"We couldn’t promote the helper user in <b>{name}</b>. Please check the bot’s permissions and try again.",
					},

					insufficientHelperPermissions: {
						title: "Helper Has Insufficient Permissions",
						message:
							"The helper user in <b>{name}</b> does not have the required administrator permissions.",
					},

					activated: {
						title: "All Set",
						message:
							"The chat <b>{name}</b> has been activated successfully. You can now apply for reviewer verification and official listing.",
					},

					verified: {
						title: "Chat Verified",
						message:
							"The chat <b>{name}</b> has been verified by our reviewers and is now officially listed.",
					},

					rejected: {
						title: "Verification Rejected",
						message:
							"The chat <b>{name}</b> did not pass our review. It will not be officially listed, but it can still be accessed via its entity link. You may fix the issues and apply again.",
					},

					deactivated: {
						title: "Chat Deactivated",
						message:
							"The chat <b>{name}</b> no longer meets the requirements and has been deactivated. The bot and helper user have left the chat. Once the issues are resolved, you can activate it again.",
					},
				},
			},
		},
	},
} as const;

export default dictionary;
