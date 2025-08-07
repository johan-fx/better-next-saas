import { stripeClient } from "@better-auth/stripe/client";
import {
	adminClient,
	inferAdditionalFields,
	organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? "";
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

const isStripeEnabled = !!stripeSecretKey && !!stripeWebhookSecret;

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
