import type { ServerWebSocket } from "bun";
import { wsSend } from "../../utils/ws";

export const handlerWSPing = (
	ws: ServerWebSocket<any>,
	message: Record<string, any>,
) => {
	wsSend(ws, {
		type: "pong",
		data: {
			ts: message.ts ?? Date.now(),
		},
	});
};
