import { FastifyInstance } from "fastify";

export default async (fastify: FastifyInstance, options: Object) => {
	fastify.get("/oembed", async (request, reply) => {
		const query = request.query as any;
		const body = JSON.stringify({
			author_name: query.title,
			author_url: query.url
		});
		return await reply.type("application/json+oembed").send(body);
	});
}