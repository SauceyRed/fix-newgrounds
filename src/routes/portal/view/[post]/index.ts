import { FastifyInstance } from "fastify";
import { browserContext } from "../../../../index.js";
import { expect } from "playwright/test";
import TurndownService from "turndown";
import htmlToMarkdown from "../../../../utils/htmlToMarkdown.js";
import { configDotenv } from "dotenv";

export default async (fastify: FastifyInstance, options: Object) => {
	fastify.get("/portal/view/:post", async (request, reply) => {
		console.log("Path: " + request.url);
		const path = request.url;
		console.log("USER AGENT:", request.headers["user-agent"]);
		const pageUrl = `https://www.newgrounds.com${path}`;

		if (!request.headers["user-agent"]?.includes("Discordbot")) {
			//return await reply.redirect(pageUrl);
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
				const authorComments = await page.locator("#author_comments").innerHTML({ timeout: 500 });
				console.log("AUTHOR COMMENTS:", authorComments);
				const turndowned = htmlToMarkdown(authorComments);
				console.log("AUTHOR COMMENTS TURNDOWNED:", turndowned);
				comments = turndowned;
			} catch (error) {
				fastify.log.error("Failed to get author comments:", error);
			}
			console.log("Author comments:", comments);
			let video: string | null;
			let videoType: string | null;
			const videoDiv = page.locator(`#ng-global-video-player`);
			if (videoDiv) {
				const videoWrapper = page.locator(`#ng-global-video-player`);
				console.log("Post is video");
				const videoSource = videoWrapper.locator("source").first();
				videoType = await videoSource.getAttribute("type");
				const oldVideoSource = await videoSource.getAttribute("src");
				console.log("old video source:", oldVideoSource);
				videoDiv.click();
				await expect(videoSource).toHaveAttribute("src", /^http/);
				const newVideoSource = await videoSource.getAttribute("src");
				console.log("new video source:", newVideoSource);
				video = await videoSource.getAttribute("src");
			} else {
				console.log("Post is not art or video");
				return;
			}

			if (!video) {
				console.log("No video link:", video);
				return;
			}

			let uploaded: string | undefined;
			let statsText: string | undefined;
			try {
				console.log("Getting post stats...");
				const stats = await page.locator("dd").all();
				const views = "👀 " + await stats[0].textContent({ timeout: 500 });
				const faves = "🌟 " + await stats[1].locator("#faves_load").textContent({ timeout: 500 });
				const votes = "🖐️ " + await stats[2].textContent({ timeout: 500 });
				const score = "⭐ " + (await stats[3].locator("#score_number").textContent({ timeout: 500 })) + " / 5.00";
				uploaded = (await stats[4].textContent({ timeout: 500 })) + " " + (await stats[5].textContent({ timeout: 500 }));
				statsText = `${views} ${faves} ${votes} ${score}`;
			} catch (error) {
				console.error("Post stats missing");
			}
			
			let description = "";
			if (comments) {
				if (statsText) {
					description = `${comments}\n\n${statsText}`;
				} else {
					description = comments;
				}
			} else if (statsText) {
				description = statsText;
			}

			if (uploaded) {
				description += `\n\n${uploaded}`;
			}

			console.log("oembed url:", `${request.protocol}://${request.host}${path.split("?")[0]}/oembed.json`);
			configDotenv();
			const baseUrl = process.env.BASE_URL;
			const oembedUrl = new URL("oembed", baseUrl);
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
						<meta property="og:video" content="${video}" />
						<meta property="og:video:secure_url" content="${video}" />
						<meta property="og:video:type" content="${videoType}" />
						<meta property="og:site_name" content="FixNewgrounds" />
						<meta property="twitter:title" content="${title}" />
						<meta property="twitter:site" content="${author}" />
						<meta property="twitter:creator" content="${author}" />
						<meta property="twitter:player:stream" content="${video}" />
						<meta property="twitter:player:stream:content_type" content="${videoType}" />
						<meta property="twitter:card" content="player" />
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
