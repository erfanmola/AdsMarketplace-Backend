import { sleep } from "bun";
import { db } from "../utils/database";
import { offerReject } from "../utils/offers";

export const handleRejectExpiredOffers = async () => {
	const offers = await db
		.selectFrom("offers")
		.select(["id"])
		.where("start_at", "<=", new Date())
		.where("status", "=", 0)
		.execute();

	for (const offer of offers) {
		await offerReject(offer.id);
		await sleep(250);
	}
};
