import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

/**
 * Link-preview scrapers need absolute URLs, so index.html's %SITE_URL% is
 * replaced with the production address Vercel provides at build time. Locally
 * it's empty, leaving root-relative paths that work in the browser.
 */
function siteUrl(): Plugin {
	const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;
	const url = host ? `https://${host}` : "";
	return {
		name: "site-url",
		transformIndexHtml: (html) => html.replaceAll("%SITE_URL%", url),
	};
}

export default defineConfig({
	plugins: [react(), siteUrl()],
});
