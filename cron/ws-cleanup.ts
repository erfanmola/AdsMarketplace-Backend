import { wsConnections } from "../api/routes/ws";

export const handleWSCleanup = async () => {
	for (const ws of wsConnections) {
		if (
			!ws.data.store.user_id &&
			Date.now() - ws.data.store.created_at > 60_000
		) {
			ws.terminate();
		}
	}
};
