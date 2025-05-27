import { FastifyInstance } from "fastify";

export default async (fastify: FastifyInstance, options: Object) => {
	fastify.get("/", async (request, reply) => {
		return await reply.redirect("https://github.com/SauceyRed/fix-newgrounds");
	});
}