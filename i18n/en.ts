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
	categories: {
		general: "General",
		news: "News & Media",
		business: "Business & Finance",
		crypto: "Crypto & Web3",
		tech: "Technology & AI",
		programming: "Programming & Development",
		entertainment: "Entertainment & Media",
		memes: "Memes & Humor",
		gaming: "Gaming",
		education: "Education & Learning",
		lifestyle: "Lifestyle & Health",
		adult: "Adult / 18+",
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
		en_US: "English (US)",
		en_GB: "English (UK)",
		es: "Spanish",
		es_419: "Spanish (Latin America)",
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
		nb: "Norwegian Bokmål",
		nl: "Dutch",
		no: "Norwegian",
		pl: "Polish",
		pt: "Portuguese",
		pt_BR: "Portuguese (Brazil)",
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
		zh_CN: "Chinese (Simplified)",
		zh_TW: "Chinese (Traditional)",
	},
} as const;

export default dictionary;
