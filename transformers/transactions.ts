import type { DBSchema } from "../schema";

export const transformSelfTransactionAPI = (
	transaction: Partial<DBSchema["transactions"]>,
) => {
	const { id, amount, pending } = transaction;

	return {
		id,
		amount: Math.trunc((Number(amount) ?? 0) * 100) / 100,
		pending,
	};
};
