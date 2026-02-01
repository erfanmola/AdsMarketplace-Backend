import fs from "node:fs/promises";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { env } from "../utils/env";

const rl = createInterface({ input, output });

const stringSession = new StringSession("");

const client = new TelegramClient(
	stringSession,
	env.TELEGRAM_API_ID,
	env.TELEGRAM_API_HASH,
	{
		connectionRetries: 5,
	},
);

await client.start({
	phoneNumber: async () => await rl.question("Please enter your number: "),
	password: async () => await rl.question("Please enter your password: "),
	phoneCode: async () =>
		await rl.question("Please enter the code you received: "),
	onError: (err) => console.log(err),
});

client.session.save();

const me = await client.getMe();

await fs.writeFile(
	`${__dirname}/../sessions/${me.id}.session`,
	JSON.stringify(client.session.save()),
);

await client.disconnect();
rl.close();

console.log("Logged in successfully");
