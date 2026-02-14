import { AnimatedEmojis } from "nyx-bot-client";
import { CustomEmojiPacks } from "../information/emoji";

const dictionary = {
	general: {
		greet: "Hello {name}!",
		flood: "Due to spam, we are unable to respond to your request.",
	},
	message: {
		private: {
			commands: {
				campaignBanner: {
					text: `<tg-emoji emoji-id="${CustomEmojiPacks.duck.organizingShelves}">🗃️</tg-emoji> Please send your banner.\n\nYou can upload text, a photo, or a video.\n\nTo cancel, use /start.`,
					success: {
						text: `<tg-emoji emoji-id="${CustomEmojiPacks.duck.enjoyDrink}">🎉</tg-emoji> Your banner is live!\n\nHead back to the app and start sending offers to channels.`,
						button: "View Campaign",
					},
					confirm: {
						text: `<tg-emoji emoji-id="${CustomEmojiPacks.duck.confirm}">✅</tg-emoji> Do you confirm that you want to set this banner for the campaign?`,
						confirm: "Confirm",
						cancel: "Cancel",
					},
					errors: {
						active: `<tg-emoji emoji-id="${CustomEmojiPacks.duck.detective}">🕵️‍♂️</tg-emoji> This campaign already has a banner.`,
						invalid: `<tg-emoji emoji-id="${CustomEmojiPacks.duck.forbidden}">🚫</tg-emoji> This campaign doesn’t exist.`,
						invalidType: `<tg-emoji emoji-id="${CustomEmojiPacks.duck.forbidden}">🚫</tg-emoji> That doesn’t look like a valid banner. Please send text, a photo, or a video.\n\nTo cancel, use /start.`,
						mediaGroup: `<tg-emoji emoji-id="${CustomEmojiPacks.duck.forbidden}">🚫</tg-emoji> We don’t support media groups at the moment. Please send text, a photo, or a video.\n\nTo cancel, use /start.`,
					},
				},
			},
		},
	},
	offers: {
		campaigns: {
			text: `<tg-emoji emoji-id="${AnimatedEmojis["📬"]}">📬</tg-emoji> <b>New campaign offer</b>\n\n<b>{chat_name}</b> has expressed readiness to participate in <b>{campaign_name}</b>.`,
			button: {
				view: "View Offer",
			},
		},
		entities: {
			formatters: {
				duration: "{hour} Hours",
				types: {
					"channel-post": "Channel Post",
					"channel-story": "Channel Story",
					"group-pin": "Group Pin",
				},
			},
			messages: {
				in: {
					initial: `<tg-emoji emoji-id="${AnimatedEmojis["📣"]}">📣</tg-emoji> Ads Offer Sent\n\n<tg-emoji emoji-id="${AnimatedEmojis["🗂"]}">🗂</tg-emoji> Chat: <b>{chat}</b> (@{username})\n<tg-emoji emoji-id="${AnimatedEmojis["🗳"]}">🗳</tg-emoji> Type: <b>{type}</b>\n\n<tg-emoji emoji-id="${AnimatedEmojis["📆"]}">📆</tg-emoji> Date: <b>{date} UTC</b>\n<tg-emoji emoji-id="${AnimatedEmojis["⏳"]}">⏳</tg-emoji> Duration: <b>{duration}</b>\n<tg-emoji emoji-id="${AnimatedEmojis["💰"]}">💰</tg-emoji> Price: <b>{price} TON</b> <tg-emoji emoji-id="${CustomEmojiPacks.custom.ton}">💰</tg-emoji>\n\n<tg-emoji emoji-id="${AnimatedEmojis["💡"]}">💡</tg-emoji> In case of rejection or not accepting until the due date, you'll be refunded.\n\n<tg-emoji emoji-id="${AnimatedEmojis["💬"]}">💬</tg-emoji> You can directly send message to the chat owner from this topic, try it out!`,
					buttons: {
						entity: "View Entity",
					},
				},
				out: {
					initial: `<tg-emoji emoji-id="${AnimatedEmojis["📣"]}">📣</tg-emoji> New Ads Offer Received\n\n<tg-emoji emoji-id="${AnimatedEmojis["🗂"]}">🗂</tg-emoji> Chat: <b>{chat}</b> (@{username})\n<tg-emoji emoji-id="${AnimatedEmojis["🗳"]}">🗳</tg-emoji> Type: <b>{type}</b>\n\n<tg-emoji emoji-id="${AnimatedEmojis["📆"]}">📆</tg-emoji> Date: <b>{date} UTC</b>\n<tg-emoji emoji-id="${AnimatedEmojis["⏳"]}">⏳</tg-emoji> Duration: <b>{duration}</b>\n<tg-emoji emoji-id="${AnimatedEmojis["💰"]}">💰</tg-emoji> Price: <b>{price} TON</b> <tg-emoji emoji-id="${CustomEmojiPacks.custom.ton}">💰</tg-emoji>\n\n<tg-emoji emoji-id="${AnimatedEmojis["💡"]}">💡</tg-emoji> You'll be able to withdraw the money after the ads duration is done.\n\n<tg-emoji emoji-id="${AnimatedEmojis["💬"]}">💬</tg-emoji> You can directly send message to the offerer from this topic, try it out!`,
					buttons: {
						accept: "Accept Offer",
						reject: "Reject Offer",
						campaign: "View Campaign",
					},
				},
			},
		},
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
		balance: {
			increase: {
				title: "Balance Charged",
				text: `<tg-emoji emoji-id="${AnimatedEmojis["💰"]}">💰</tg-emoji> Your balance is increased by <b>{amount} TON</b> <tg-emoji emoji-id="${CustomEmojiPacks.custom.ton}">💰</tg-emoji>.`,
			},
			decrease: {
				title: "Balance Spent",
				text: `<tg-emoji emoji-id="${AnimatedEmojis["💸"]}">💸</tg-emoji> Your balance is spent by <b>{amount} TON</b> <tg-emoji emoji-id="${CustomEmojiPacks.custom.ton}">💰</tg-emoji>.`,
			},
		},
	},
	categories: {
		general: "General",
		news: "News",
		business: "Business",
		crypto: "Crypto",
		tech: "Tech",
		programming: "Programming",
		entertainment: "Entertainment",
		memes: "Memes",
		gaming: "Gaming",
		education: "Education",
		lifestyle: "Lifestyle",
		adult: "Adult 18+",
	},
	languages: {
		af: "Afrikaans",
		ar: "Arabic",
		az: "Azerbaijani",
		be: "Belarusian",
		bg: "Bulgarian",
		bn: "Bengali",
		ca: "Catalan",
		cs: "Czech",
		da: "Danish",
		de: "German",
		el: "Greek",
		en: "English",
		es: "Spanish",
		et: "Estonian",
		fa: "Persian",
		fi: "Finnish",
		fr: "French",
		gl: "Galician",
		he: "Hebrew",
		hi: "Hindi",
		hr: "Croatian",
		hu: "Hungarian",
		hy: "Armenian",
		id: "Indonesian",
		is: "Icelandic",
		it: "Italian",
		ja: "Japanese",
		ka: "Georgian",
		kk: "Kazakh",
		km: "Khmer",
		ko: "Korean",
		ku: "Kurdish",
		ky: "Kyrgyz",
		lo: "Lao",
		lt: "Lithuanian",
		lv: "Latvian",
		mk: "Macedonian",
		mn: "Mongolian",
		ms: "Malay",
		nl: "Dutch",
		no: "Norwegian",
		pl: "Polish",
		pt: "Portuguese",
		ro: "Romanian",
		ru: "Russian",
		si: "Sinhala",
		sk: "Slovak",
		sl: "Slovenian",
		sq: "Albanian",
		sr: "Serbian",
		sv: "Swedish",
		sw: "Swahili",
		ta: "Tamil",
		tg: "Tajik",
		th: "Thai",
		tk: "Turkmen",
		tr: "Turkish",
		uk: "Ukrainian",
		ur: "Urdu",
		uz: "Uzbek",
		vi: "Vietnamese",
		zh: "Chinese",
	},
} as const;

export default dictionary;
