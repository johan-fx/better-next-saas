import "server-only";
import { env } from "./env";

export function getTrustedOrigins() {
	return Array.from(
		new Set([
			env.BETTER_AUTH_URL ?? "",
			env.NEXT_PUBLIC_APP_URL ?? "",
			env.NEXT_PUBLIC_API_URL ?? "",
		]),
	);
}
