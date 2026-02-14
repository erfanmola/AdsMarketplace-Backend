import fs from "node:fs/promises";
import type { Handler } from "elysia";
import type { Gallery } from "../../gallery";

export const routeGETGallery: Handler = async () => {
	let gallery: Gallery = [];

	try {
		gallery = JSON.parse(
			(
				await fs.readFile(`${__dirname}/../../gallery.json`, "utf-8")
			).toString(),
		);
	} catch {}

	return {
		status: "success",
		result: {
			gallery,
		},
	};
};
