import type { NextRequest } from "next/server";
import { authMiddleware } from "@/modules/auth/middleware";
import { i18nMiddleware } from "@/modules/i18n/middleware";

export async function middleware(request: NextRequest) {
	// Run auth middleware first for protected routes
	const authResponse = await authMiddleware(request);

	// If auth middleware returned a response (redirect), use it
	if (authResponse) {
		return authResponse;
	}

	// Otherwise, run i18n middleware for locale handling
	return i18nMiddleware(request);
}

export const config = {
	// Match all pathnames except for
	// - API routes (/api)
	// - Internal Next.js paths (/_next, /_vercel)
	// - Files with extensions (favicon.ico, etc.)
	matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
