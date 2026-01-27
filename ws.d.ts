export type WSMessage<T, D> = {
	type: T;
	data: D;
};

export type WSServerMessage = WSServerMessageAuth;

export type WSClientMessage = WSClientMessageAuth;

export type WSServerMessageAuth = WSMessage<
	"auth",
	{
		user_id: string;
	}
>;

export type WSClientMessageAuth = WSMessage<
	"auth",
	{
		token: string;
	}
>;
