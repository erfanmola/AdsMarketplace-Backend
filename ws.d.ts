export type WSMessage<T, D> = {
	type: T;
	data: D;
};

export type WSServerMessage = WSServerMessageAuth | WSServerMessageNotification;

export type WSClientMessage = WSClientMessageAuth;

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

export type WSClientMessageAuth = WSMessage<
	"auth",
	{
		token: string;
	}
>;
