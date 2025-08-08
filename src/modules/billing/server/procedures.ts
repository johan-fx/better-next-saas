import { TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import {
	baseProcedure,
	createTRPCRouter,
	protectedProcedure,
} from "@/trpc/init";
import { type Plan, plans } from "../plans";

export const billingRouter = createTRPCRouter({
	// Return configured plans enriched with Stripe price information when available
	getPlans: baseProcedure.query(async () => {
		// If Stripe is not configured, just return the static plans
		if (!env.STRIPE_SECRET_KEY) {
			return plans;
		}

		const stripe = new Stripe(env.STRIPE_SECRET_KEY);

		const result = await Promise.all(
			plans.map(async (plan) => {
				try {
					const price = await stripe.prices.retrieve(plan.priceId);
					return {
						...plan,
						price: {
							unitAmount: price.unit_amount ?? undefined,
							currency: price.currency ?? undefined,
							interval: price.recurring?.interval ?? undefined,
						},
					} as Plan;
				} catch (_) {
					return plan;
				}
			}),
		);

		return result;
	}),

	getActiveSubscription: protectedProcedure.query(async ({ ctx }) => {
		try {
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

			return activeSubscription ?? null;
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
			if (!env.STRIPE_SECRET_KEY) {
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

			const stripe = new Stripe(env.STRIPE_SECRET_KEY);

			const invoices = await stripe.invoices.list({
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
