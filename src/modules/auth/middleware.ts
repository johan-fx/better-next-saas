import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import slugify from "slugify";

// Define protected routes that need authentication
const protectedRoutes = ["/dashboard", "/auth/settings", "/account"];

// Helper function to check if a route is protected
function isProtectedRoute(pathname: string): boolean {
	return protectedRoutes.some(
		(route) => pathname.startsWith(route) || pathname.includes(`/${route}`), // Handle locale prefixes like /en/dashboard
	);
}

export async function authMiddleware(
	request: NextRequest,
): Promise<NextResponse | null> {
	const { pathname } = request.nextUrl;

	// Only run auth logic for protected routes
	if (!isProtectedRoute(pathname)) {
		return null; // Let other middleware handle this route
	}

	// Check cookie for optimistic redirects for protected routes
	const sessionCookie = getSessionCookie(request, {
		cookiePrefix: slugify(process.env.APP_NAME ?? "my-app"),
	});

	if (!sessionCookie) {
		const redirectTo = request.nextUrl.pathname + request.nextUrl.search;
		return NextResponse.redirect(
			new URL(`/auth/sign-in?redirectTo=${redirectTo}`, request.url),
		);
	}

	return null; // Continue to next middleware
}
