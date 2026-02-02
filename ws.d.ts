export type WSMessage<T, D> = {
	type: T;
	data: D;
};

export type WSServerMessage =
	| WSServerMessageAuth
	| WSServerMessageNotification
	| WSServerMessagePong;

export type WSClientMessage = WSClientMessageAuth | WSClientMessagePing;

export type WSServerMessagePong = WSMessage<
	"pong",
	{
		ts: number;
	}
>;

export type WSServerMessageAuth = WSMessage<
	"auth",
	{
		user_id: string;
	}
>;

export type WSServerMessageNotification = WSMessage<
	"notification",
	{
		notification: {
			title: string;
			message: string;
			haptic?: "none" | "success" | "error" | "warning";
		};
	}
>;

export type WSClientMessagePing = WSMessage<
	"ping",
	{
		ts: number;
	}
>;

export type WSClientMessageAuth = WSMessage<
	"auth",
	{
		token: string;
	}
>;
