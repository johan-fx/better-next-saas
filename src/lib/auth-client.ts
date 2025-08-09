import { stripeClient } from "@better-auth/stripe/client";
import {
	adminClient,
	inferAdditionalFields,
	organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

// Client-safe flag derived from public env var
const isStripeEnabled =
	!!process && process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true";

export const authClient = createAuthClient({
	plugins: [
		inferAdditionalFields<typeof auth>(),
		adminClient(),
		organizationClient({
			// Configure with custom access control system
			teams: {
				enabled: true,
			},
		}),
		...(isStripeEnabled
			? [
					stripeClient({
						subscription: true,
					}),
				]
			: []),
	],
});
