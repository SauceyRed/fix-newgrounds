import { FastifyInstance } from "fastify";
import { createReadStream } from "node:fs";
import { chromium } from "playwright";
import { browserContext } from "../../../../../index.js";

export default async (fastify: FastifyInstance, options: Object) => {
	fastify.get("/art/view/:artist/:post", async (request, reply) => {
		console.log("Path: " + request.url);
		const path = request.url;
		console.log("USER AGENT:", request.headers["user-agent"]);
		const pageUrl = `https://www.newgrounds.com${path}`;

		if (!request.headers["user-agent"]?.includes("Discordbot")) {
			return await reply.redirect(pageUrl);
		}
		
		const startTime = Date.now();
		const page = await browserContext.newPage();
		try {

			page.setDefaultTimeout(10000);
			await page.goto(pageUrl);
			console.log("page title:", await page.title());
	
			console.log("Getting og:content...");
			const title = await page.locator("meta[property='og:title']").first().getAttribute("content");
			console.log("og:title:", title);
			console.log("Getting author...");
			const author = await page.locator(".item-details-main h4 a").first().textContent({ timeout: 500 });
			console.log("Author:", author);
			const authorUrl = `https://${author}.newgrounds.com/`;
			console.log("Getting author comments...");
			let comments;
			try {
				comments = await page.locator("#author_comments").textContent({ timeout: 500 });
			} catch (error) {
				fastify.log.error("Failed to get author comments:", error);
			}
			console.log("Author comments:", comments);
			console.log("Getting image source...");
			const image = await page.locator(".pod-body").first().locator("a").first().getAttribute("href");
			console.log("Image source:", image);
			console.log("Getting score...");
			const stats = await page.locator("#sidestats > .sidestats > dd").all();
			const views = "👀 " + await stats[0].textContent({ timeout: 500 });
			const faves = "🌟 " + await stats[1].locator("#faves_load").textContent({ timeout: 500 });
			const votes = "🖐️ " + await stats[2].textContent({ timeout: 500 });
			const score = "⭐ " + (await stats[3].locator("#score_number").textContent({ timeout: 500 })) + " / 5.00";
			const uploaded = (await stats[4].textContent({ timeout: 500 })) + " " + (await stats[5].textContent({ timeout: 500 }));
			const statsText = `${views} ${faves} ${votes} ${score}`;
			
			let description = "";
			if (comments) {
				description = `${comments}\n\n${statsText}`;
			} else {
				description = statsText;
			}

			if (uploaded) {
				description += `\n\n${uploaded}`;
			}

			console.log("oembed url:", `${request.protocol}://${request.host}${path.split("?")[0]}/oembed.json`);
			const oembedUrl = new URL(`${request.protocol}://${request.host}/oembed`);
			if (author) oembedUrl.searchParams.set("title", author.toLowerCase());
			if (pageUrl) oembedUrl.searchParams.set("url", authorUrl);
			console.log("actual oembed url:", oembedUrl);
			const htmlResponse = `
					<!DOCTYPE html>
					<head>
						<link rel="canonical" href="${pageUrl}" />
						<meta property="og:title" content="${title}" />
						<meta property="og:description" content="${description}" />
						<meta property="og:url" content="${pageUrl}" />
						<meta property="og:image" content="${image}" />
						<meta property="og:site_name" content="FixNewgrounds" />
						<meta property="twitter:title" content="${title}" />
						<meta property="twitter:site" content="${author}" />
						<meta property="twitter:creator" content="${author}" />
						<meta property="twitter:card" content="summary_large_image" />
						<meta property="theme-color" content="#fda238" />
						<link rel="alternate"
							href="${oembedUrl}"
							type="application/json+oembed" title="${author}">
					</head>
	
					<body></body>
	
					</html>
				`;
			await page.close();
			const endTime = Date.now();
			console.log("Duration:", (endTime - startTime) / 1000);
			return reply.type("text/html").send(htmlResponse);
		} catch (error) {
			console.error("Error occurred:", error);
			if(!page.isClosed()) {
				page.close();
			}
		}
	});
}
