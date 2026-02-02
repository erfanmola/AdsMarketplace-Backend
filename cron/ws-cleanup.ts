import { wsConnections } from "../api/routes/ws";

export const handleWSCleanup = async () => {
	for (const ws of wsConnections) {
		if (!ws.data.user_id && Date.now() - ws.data.created_at > 60_000) {
			ws.terminate();
		}
	}
};
