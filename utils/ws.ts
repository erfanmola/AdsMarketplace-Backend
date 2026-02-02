import type { ServerWebSocket } from "elysia/ws/bun";
import { wsConnections } from "../api/routes/ws";
import type { WSServerMessage } from "../ws";

export const wsSend = (ws: ServerWebSocket<any>, message: WSServerMessage) => {
	ws.send(JSON.stringify(message));
};

export const findWsByUserId = (user_id: number | string) =>
	wsConnections.find((i) => i.data.user_id === Number(user_id));

export const wsSendUser = (
	user_id: number,
	message: WSServerMessage,
): boolean => {
	const ws = findWsByUserId(user_id);
	if (!ws) return false;

	ws.send(JSON.stringify(message));

	return true;
};
