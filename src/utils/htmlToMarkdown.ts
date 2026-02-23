import TurndownService from "turndown";

export default function(html: string): string {
	console.log("htmlToMarkdown starting");
	const turndownService = new TurndownService();
	console.log("created tunrdown service");
	turndownService.addRule("pre", {
		filter: "pre",
		replacement: (content) => `\`\`\`\n${content}\n\`\`\``,
	});
	console.log("registered pre rule");
	turndownService.addRule("link", {
		filter: "a",
		replacement: (_, node) => {
			const linkNode = node as HTMLAnchorElement;
	
			if (linkNode.href == linkNode.textContent) {
				return linkNode.href;
			}

			return `${linkNode.textContent} (${linkNode.href})`;
		},
	});

	return turndownService.turndown(html.replaceAll("<p><br></p>", ""));
}