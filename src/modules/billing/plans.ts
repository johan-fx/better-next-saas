import type { Subscription as BetterAuthSubscription } from "@better-auth/stripe";
import type Stripe from "stripe";

export type Plan = {
	id: number;
	name: string;
	/**
	 * Distinct Stripe Price IDs for monthly and yearly billing periods.
	 */
	annualDiscountPriceId: string;
	priceId: string;
	limits: {
		seats: number;
		monthlyCredits: number;
	};
	/**
	 * Enriched price info. `price` mirrors monthly for backward compatibility,
	 * while `prices` exposes both monthly and yearly.
	 */
	price?: {
		unitAmount: number;
		currency: string;
		interval: string;
	};
	prices?: {
		monthly?: {
			unitAmount: number;
			currency: string;
			interval: string;
		};
		yearly?: {
			unitAmount: number;
			currency: string;
			interval: string;
		};
	};
};

export enum BillingPeriod {
	MONTHLY = "monthly",
	YEARLY = "yearly",
}

export const plans: Plan[] = [
	{
		id: 1,
		name: "Basic",
		// Keep priceId pointing to monthly for backward compatibility
		priceId: "price_1RtByU5ZK2K6r0Nz39QwKDXG",
		annualDiscountPriceId: "price_1RuAbW5ZK2K6r0NzCQKAK080",
		limits: {
			seats: 1,
			monthlyCredits: 1000,
		},
	},
	{
		id: 2,
		name: "Plus",
		priceId: "price_1RuAcO5ZK2K6r0NzY6xd5UyB",
		annualDiscountPriceId: "price_1RuAd45ZK2K6r0NzvHfm272x",
		limits: {
			seats: 3,
			monthlyCredits: 3000,
		},
	},
	{
		id: 3,
		name: "Pro",
		priceId: "price_1RuAg05ZK2K6r0NzYEqA0HUc",
		annualDiscountPriceId: "price_1RuAgH5ZK2K6r0NzR9e5eQPp",
		limits: {
			seats: 5,
			monthlyCredits: 10000,
		},
	},
];

export enum SubscriptionStatus {
	ACTIVE = "active",
	CANCELED = "canceled",
	INCOMPLETE = "incomplete",
	INCOMPLETE_EXPIRED = "incomplete_expired",
	PAST_DUE = "past_due",
	PAUSED = "paused",
	TRIALING = "trialing",
	UNPAID = "unpaid",
}

export type Subscription = {
	limits: Record<string, number> | undefined;
} & BetterAuthSubscription;

// Map Stripe.Subscription -> App Subscription shape

export function mapStripeToAppSubscription(
	s: Stripe.Subscription,
	orgId: string | undefined,
	allPlans: Plan[],
): Subscription {
	const primaryItem = s.items.data[0];
	const priceId = primaryItem?.price?.id;
	const matchedPlan = allPlans.find(
		(p) => p.priceId === priceId || p.annualDiscountPriceId === priceId,
	);

	const status = s.status as SubscriptionStatus; // matches our union

	const periodStartTs = primaryItem?.current_period_start ?? null;
	const periodEndTs = primaryItem?.current_period_end ?? null;

	return {
		id: s.id,
		plan: matchedPlan?.name ?? primaryItem?.price?.nickname ?? "Unknown",
		priceId: priceId,
		limits: matchedPlan?.limits,
		stripeCustomerId: (typeof s.customer === "string"
			? s.customer
			: s.customer?.id) as string | undefined,
		stripeSubscriptionId: s.id,
		trialStart: s.trial_start ? new Date(s.trial_start * 1000) : undefined,
		trialEnd: s.trial_end ? new Date(s.trial_end * 1000) : undefined,
		referenceId: orgId ?? "",
		status,
		periodStart: periodStartTs ? new Date(periodStartTs * 1000) : undefined,
		periodEnd: periodEndTs ? new Date(periodEndTs * 1000) : undefined,
		cancelAtPeriodEnd: s.cancel_at_period_end ?? undefined,
		groupId: undefined,
		seats:
			primaryItem?.quantity ??
			(s as unknown as { quantity?: number }).quantity ??
			undefined,
	};
}
