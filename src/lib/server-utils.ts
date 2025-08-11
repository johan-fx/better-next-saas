import "server-only";
import { env } from "./env";

export function getTrustedOrigins() {
	const origins = [
		env.BETTER_AUTH_URL,
		env.NEXT_PUBLIC_APP_URL,
		env.NEXT_PUBLIC_API_URL,
	].filter(Boolean) as string[];

	return Array.from(new Set(origins));
}
