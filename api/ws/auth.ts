import type { ServerWebSocket } from "bun";
import z from "zod/v3";
import { wsSend } from "../../utils/ws";
import { jwtVerifier } from "../plugins/jwt";

const validator = z.object({
	token: z.string().nonempty(),
});

export const handlerWSAuth = (
	ws: ServerWebSocket<any>,
	message: Record<string, any>,
) => {
	const { success, data } = validator.safeParse(message);

	if (success) {
		const { token } = data;

		try {
			const jwt = jwtVerifier(token);

			if (jwt?.user_id && jwt.exp >= Math.floor(Date.now() / 1000)) {
				ws.data.user_id = Number(jwt.user_id);

				wsSend(ws, {
					type: "auth",
					data: {
						user_id: jwt.user_id.toString(),
					},
				});
				return;
			}
		} catch (_) {}
	}

	ws.terminate();
};
