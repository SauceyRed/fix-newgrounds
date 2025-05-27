import { chromium } from "playwright";

async function main() {
	const browserContext = await chromium.launchPersistentContext("profile", { headless: false });
	const page = await browserContext.newPage();
	page.goto("https://newgrounds.com");
}

main();
