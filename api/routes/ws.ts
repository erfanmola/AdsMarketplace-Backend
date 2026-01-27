import type { ServerWebSocket } from "elysia/ws/bun";
import z from "zod/v3";
import { handlerWSAuth } from "../ws/auth";

export const wsConnections: ServerWebSocket<any>[] = [];

export const handlerWSOpen = async (ws: ServerWebSocket<any>) => {
	ws.data.store.created_at = Date.now();
	wsConnections.push(ws);
};

export const handlerWSClose = (
	ws: ServerWebSocket<any>,
	code: number,
	reason: string,
) => {
	wsConnections.splice(wsConnections.indexOf(ws), 1);
};

const messageValidator = z.object({
	type: z.enum(["auth"]),
	data: z.record(z.any()),
});

export const handlerWSMessage = (
	ws: ServerWebSocket<any>,
	message: unknown,
) => {
	const { success, data } = messageValidator.safeParse(message);

	if (success) {
		switch (data.type) {
			case "auth":
				handlerWSAuth(ws, data.data);
				break;
		}
	}
};
