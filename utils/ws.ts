import type { ServerWebSocket } from "elysia/ws/bun";
import type { WSServerMessage } from "../ws";

export const wsSend = (ws: ServerWebSocket<any>, message: WSServerMessage) => {
	ws.send(JSON.stringify(message));
};
