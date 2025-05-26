import Fastify from "fastify";
import index from "./routes/index.js";
import post from "./routes/art/view/[artist]/[post]/[post].js";
import oembed from "./routes/art/view/[artist]/[post]/oembed.js";
import status from "./routes/users/[user]/statuses/[status].js"

async function main() {
	const fastify = Fastify({
		logger: true
	});

	fastify.register(index);
	fastify.register(post);
	fastify.register(oembed);
	fastify.register(status)

	try {
		await fastify.listen({ port: 5430 });
	} catch (error) {
		fastify.log.error(error);
		process.exit(1);
	}
}

main();
