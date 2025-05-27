import Fastify from "fastify";
import root from "./routes/index.js";
import post from "./routes/art/view/[artist]/[post]/index.js";
import oembed from "./routes/oembed.js";
import { chromium } from "playwright";

export const browserContext = await chromium.launchPersistentContext("profile",
	{ headless: true, userAgent: "FixNewgroundsBot/1.0 (+https://fixnewgrounds.com; mailto:contact@fixnewgrounds.com)" }
);

async function main() {
	const fastify = Fastify({
		logger: true
	});

	fastify.register(root);
	fastify.register(post);
	fastify.register(oembed);

	try {
		await fastify.listen({ port: 7854 });
	} catch (error) {
		fastify.log.error(error);
		process.exit(1);
	}
}

main();
