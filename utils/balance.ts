import type { Insertable } from "kysely";
import type { DB } from "../db";
import { db } from "./database";
import { t } from "./i18n";
import { createNotification } from "./notifications";

export const getBalance = async (user_id: number, includePending = false) => {
	let result: any;

	if (includePending) {
		result = await db
			.selectFrom("transactions")
			.select(({ fn }) => [fn.sum<number>("amount").as("total_amount")])
			.where("user_id", "=", user_id.toString())
			.executeTakeFirst();
	} else {
		result = await db
			.selectFrom("transactions")
			.select(({ fn }) => [fn.sum<number>("amount").as("total_amount")])
			.where("user_id", "=", user_id.toString())
			.where("pending", "=", 0)
			.executeTakeFirst();
	}

	return Number(result?.total_amount ?? 0);
};

export const createTransaction = async (
	transaction: Insertable<DB["transactions"]>,
	notify = true,
) => {
	if (notify && !transaction.pending) {
		if (Number(transaction.amount) > 0) {
			createNotification({
				message: t("en", "notifications.balance.increase.text", {
					amount: (
						Math.trunc(Number(transaction.amount) * 100) / 100
					).toString(),
				}),
				title: t("en", "notifications.balance.increase.title"),
				user_id: Number(transaction.user_id),
				haptic: "success",
			});
		} else {
			createNotification({
				message: t("en", "notifications.balance.decrease.text", {
					amount: Math.abs(
						Math.trunc(Number(transaction.amount) * 100) / 100,
					).toString(),
				}),
				title: t("en", "notifications.balance.decrease.title"),
				user_id: Number(transaction.user_id),
				haptic: "none",
			});
		}
	}

	const result = await db
		.insertInto("transactions")
		.values(transaction)
		.returning("id")
		.execute();

	return result[0]?.id ?? undefined;
};
