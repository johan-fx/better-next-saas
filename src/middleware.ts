import createMiddleware from "next-intl/middleware";
import { routing } from "@/modules/i18n/routing";

export default createMiddleware(routing);

export const config = {
	// Match all pathnames except for
	// - API routes (/api)
	// - Internal Next.js paths (/_next, /_vercel)
	// - Files with extensions (favicon.ico, etc.)
	matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
