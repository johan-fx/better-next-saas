import "server-only";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Centralized Stripe client singleton.
 *
 * We intentionally instantiate Stripe once and reuse it across the app
 * to avoid unnecessary HTTP agent/socket creation and to follow the
 * layered-service pattern.
 *
 * If Stripe is not configured (no secret key), this will be undefined.
 */
export const stripeClient: Stripe | undefined = stripeSecretKey
	? new Stripe(stripeSecretKey)
	: undefined;

/**
 * Convenience flag for feature gating Stripe functionality.
 */
export const isStripeEnabled =
	Boolean(stripeSecretKey) && Boolean(stripeWebhookSecret);
