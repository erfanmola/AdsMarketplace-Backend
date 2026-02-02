import type { ServerWebSocket } from "bun";
import z from "zod/v3";
import { handlerWSAuth } from "../ws/auth";
import { handlerWSPing } from "../ws/ping";

export const wsConnections: ServerWebSocket<any>[] = [];

export const handlerWSOpen = async (ws: ServerWebSocket<any>) => {
	ws.data.created_at = Date.now();
	wsConnections.push(ws);
};

export const handlerWSClose = (
	ws: ServerWebSocket<any>,
	code: number,
	reason: string,
) => {
	const idx = wsConnections.indexOf(ws);

	if (idx !== -1) {
		wsConnections.splice(idx, 1);
	}
};

const messageValidator = z.object({
	type: z.enum(["auth", "ping"]),
	data: z.record(z.any()),
});

export const handlerWSMessage = (ws: ServerWebSocket<any>, message: any) => {
	const { success, data } = messageValidator.safeParse(
		typeof message === "string" ? JSON.parse(message) : String(message),
	);

	if (success) {
		switch (data.type) {
			case "ping":
				handlerWSPing(ws, data.data);
				break;
			case "auth":
				handlerWSAuth(ws, data.data);
				break;
		}
	}
};
