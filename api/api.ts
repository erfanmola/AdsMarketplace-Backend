import cors from "@elysiajs/cors";
import Elysia from "elysia";
import z from "zod";
import { env } from "../utils/env";
import { pluginJWT } from "./plugins/jwt";
import { pluginPools } from "./plugins/pools";
import { routePOSTAuthorize } from "./routes/authorize";
import { routePOSTBotWebhook } from "./routes/bot-webhook";
import { routeGETCampaign } from "./routes/campaigns/campaign";
import { routePOSTCampaignsCreate } from "./routes/campaigns/create";
import { routePOSTCampaignsOffer } from "./routes/campaigns/offer";
import { routeGETCampaignsOwned } from "./routes/campaigns/owned";
import { routePOSTCampaignsUpdate } from "./routes/campaigns/update";
import { routeGETDefault } from "./routes/default";
import { routeGETEntity } from "./routes/entities/entity";
import { routeGETEntitiesOwned } from "./routes/entities/owned";
import { routePOSTEntityUpdate } from "./routes/entities/update";
import { routeGETHealth } from "./routes/health";
import { handlerWSClose, handlerWSMessage, handlerWSOpen } from "./routes/ws";

export const initializeAPI = async () => {
	z.object({
		API_PORT: z.coerce.number(),
	}).parse(import.meta.env);

	const bareRoutes = new Elysia()
		.get("/health", routeGETHealth)
		.post("/bot-webhook", routePOSTBotWebhook);

	const jwtGuardedRoutes = new Elysia()
		.use(pluginJWT)
		// Entities
		.get("/entities/:id", routeGETEntity)
		.post("/entities/:id/update", routePOSTEntityUpdate)
		.get("/entities/owned/:offset", routeGETEntitiesOwned)

		// Campaigns;
		.get("/campaigns/:id", routeGETCampaign)
		.get("/campaigns/owned/:offset", routeGETCampaignsOwned)
		.post("/campaigns/create", routePOSTCampaignsCreate)
		.post("/campaigns/:id/update", routePOSTCampaignsUpdate)
		.post("/campaigns/:id/offer", routePOSTCampaignsOffer);

	const regularRoutes = new Elysia()
		.get("/", routeGETDefault)
		.post("/auth", routePOSTAuthorize);

	const app = new Elysia()
		.get("/ws", ({ request, server }) => {
			return server?.upgrade(request, {
				data: {},
			});
		})
		.use(bareRoutes)
		.use(cors())
		.use(pluginPools)
		.use(jwtGuardedRoutes)
		.use(regularRoutes)
		.onError(() => ({
			status: "failed",
			result: "invalid-method",
		}))
		.compile();

	const server = Bun.serve({
		port: env.API_PORT,
		hostname: env.API_HOST,
		fetch: app.handle,
		websocket: {
			open: handlerWSOpen,
			close: handlerWSClose,
			message: handlerWSMessage,
		},
		idleTimeout: 30,
	});

	app.server = server;

	return app;
};
