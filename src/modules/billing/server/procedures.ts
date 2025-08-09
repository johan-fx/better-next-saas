import type { Subscription } from "@better-auth/stripe";
import { TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { auth } from "@/lib/auth";
import { isStripeEnabled, stripeClient } from "@/lib/stripe";
import {
	baseProcedure,
	createTRPCRouter,
	protectedProcedure,
} from "@/trpc/init";
import { mapStripeToAppSubscription, type Plan, plans } from "../plans";

export const billingRouter = createTRPCRouter({
	// Return configured plans enriched with Stripe price information when available
	getPlans: baseProcedure.query(async () => {
		// If Stripe is not configured, just return the static plans
		if (!isStripeEnabled || !stripeClient) {
			return plans;
		}

		const result = await Promise.all(
			plans.map(async (plan) => {
				try {
					// Retrieve both monthly and yearly prices if available
					const monthlyPriceId = plan.priceId;
					const yearlyPriceId = plan.annualDiscountPriceId;

					const [monthly, yearly] = await Promise.all([
						monthlyPriceId
							? stripeClient?.prices.retrieve(monthlyPriceId)
							: Promise.resolve(undefined as unknown as Stripe.Price),
						yearlyPriceId
							? stripeClient?.prices.retrieve(yearlyPriceId)
							: Promise.resolve(undefined as unknown as Stripe.Price),
					]);

					return {
						...plan,
						// Provide both monthly and yearly enriched prices when available
						prices: {
							monthly: monthly
								? {
										unitAmount: monthly.unit_amount ?? undefined,
										currency: monthly.currency ?? undefined,
										interval: monthly.recurring?.interval ?? undefined,
									}
								: undefined,
							yearly: yearly
								? {
										unitAmount: yearly.unit_amount ?? undefined,
										currency: yearly.currency ?? undefined,
										interval: yearly.recurring?.interval ?? undefined,
									}
								: undefined,
						},
					} as Plan;
				} catch {
					return plan;
				}
			}),
		);

		return result;
	}),

	getActiveSubscription: protectedProcedure.query(async ({ ctx }) => {
		try {
			const appSubscriptions: Subscription[] =
				await auth.api.listActiveSubscriptions({
					query: {
						referenceId: ctx.auth.session.activeOrganizationId ?? undefined,
					},
					headers: await headers(),
				});

			const activeAppSubscription =
				appSubscriptions.find(
					(subscription) => subscription.status === "active",
				) ?? appSubscriptions[0];

			const customerId = activeAppSubscription?.stripeCustomerId;

			if (!isStripeEnabled || !customerId) {
				return activeAppSubscription ?? null;
			}

			// Fetch the real active subscription from Stripe
			const sc = stripeClient;
			if (!sc) {
				return activeAppSubscription ?? null;
			}
			const stripeSubscriptions = await sc.subscriptions.list({
				customer: customerId,
				status: "active",
				expand: ["data.items.data.price", "data.items.data.plan"],
			});

			const stripeActiveSubscription = stripeSubscriptions.data[0] as
				| Stripe.Subscription
				| undefined;

			if (!stripeActiveSubscription) {
				return activeAppSubscription ?? null;
			}

			const activeSubscription = mapStripeToAppSubscription(
				stripeActiveSubscription,
				ctx.auth.session.activeOrganizationId ?? undefined,
				plans,
			);

			return activeSubscription;
		} catch (err) {
			console.log(err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to get active subscription",
			});
		}
	}),

	// List invoices for the current organization's Stripe customer
	getInvoices: protectedProcedure.query(async ({ ctx }) => {
		try {
			if (!isStripeEnabled) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Stripe not configured",
				});
			}

			// Get the active subscription to resolve the Stripe customer id
			const activeSubscriptions = await auth.api.listActiveSubscriptions({
				query: {
					referenceId: ctx.auth.session.activeOrganizationId ?? undefined,
				},
				headers: await headers(),
			});

			const activeSubscription =
				activeSubscriptions.find(
					(subscription) => subscription.status === "active",
				) ?? activeSubscriptions[0];

			const stripeCustomerId = activeSubscription?.stripeCustomerId;

			if (!stripeCustomerId) {
				return [];
			}

			const sc = stripeClient;
			if (!sc) {
				return [];
			}
			const invoices = await sc.invoices.list({
				customer: stripeCustomerId,
				limit: 50,
				expand: ["data.payment_intent", "data.charge"],
			});

			return invoices.data.map((invoice) => {
				return {
					id: invoice.id,
					number: invoice.number ?? undefined,
					date: new Date(invoice.created * 1000).toISOString(),
					amount: invoice.total ?? 0,
					currency: invoice.currency?.toUpperCase() ?? "USD",
					pdfUrl: invoice.invoice_pdf ?? undefined,
					hostedUrl: invoice.hosted_invoice_url ?? undefined,
					status: invoice.status,
				};
			});
		} catch (err) {
			console.log(err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to get invoices",
			});
		}
	}),
});
