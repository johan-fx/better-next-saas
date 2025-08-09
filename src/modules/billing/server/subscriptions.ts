import type { StripePlan, Subscription } from "@better-auth/stripe";
import type { User } from "better-auth";
import { and, eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { env } from "@/lib/env";
import { sendSubscriptionUpgradeEmail } from "@/modules/emails";

export async function authorizeSubscription({
	user,
	referenceId,
	action,
}: {
	user: User;
	referenceId: string;
	action: string;
}) {
	// Check if the user has permission to manage subscriptions for this reference
	if (
		[
			"upgrade-subscription",
			"cancel-subscription",
			"restore-subscription",
		].includes(action)
	) {
		const [membership] = await db
			.select()
			.from(schema.member)
			.where(
				and(
					eq(schema.member.organizationId, referenceId),
					eq(schema.member.userId, user.id),
				),
			)
			.limit(1);

		return membership?.role === "owner";
	}

	return true;
}

// Get the next billing date from the first subscription item
export const getNextBillingDate = (
	stripeSubscription: Stripe.Subscription,
): string => {
	const nextBillingTimestamp =
		stripeSubscription.items.data[0]?.current_period_end;

	if (!nextBillingTimestamp) {
		throw new Error("No billing period found for subscription");
	}

	// Convert from Unix timestamp (seconds) to JavaScript Date (milliseconds)
	return new Date(nextBillingTimestamp * 1000).toLocaleDateString();
};

export async function onSubscriptionComplete({
	subscription,
	plan,
	stripeSubscription,
}: {
	event: Stripe.Event;
	stripeSubscription: Stripe.Subscription;
	subscription: Subscription;
	plan: StripePlan;
}) {
	// Called when a subscription is successfully created
	try {
		const [membership] = await db
			.select()
			.from(schema.member)
			.where(
				and(
					eq(schema.member.organizationId, subscription.referenceId),
					eq(schema.member.role, "owner"),
				),
			);

		const [user] = await db
			.select()
			.from(schema.user)
			.where(eq(schema.user.id, membership?.userId));

		if (!user) {
			throw new Error("User not found");
		}

		const userEmail = user.email;
		const userName = user.name;
		const price = stripeSubscription.items.data[0]?.price;

		// Format billing cycle and next billing date
		const billingCycle = price?.recurring?.interval || "month";
		const nextBillingDate = getNextBillingDate(stripeSubscription);

		// Format plan price (convert from cents if needed)
		const planPrice = price?.unit_amount
			? `$${(price.unit_amount / 100).toFixed(2)}`
			: plan.name;

		// Send subscription notification email
		await sendSubscriptionUpgradeEmail({
			to: userEmail,
			userName,
			dashboardUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard`,
			planName: plan.name,
			planPrice,
			billingCycle,
			nextBillingDate,
			locale: user.language ?? "en",
		});

		console.log(
			`✅ Subscription notification email sent to ${userEmail} for plan ${plan.name}`,
		);
	} catch (error) {
		console.error("❌ Failed to send subscription notification email:", error);
		// Don't throw error to avoid breaking the subscription process
	}
}
export async function onSubscriptionUpdate({
	subscription,
}: {
	event: Stripe.Event;
	subscription: Subscription;
}) {
	// Called when a subscription is updated
	console.log(`Subscription ${subscription.id} updated`);
}

export async function onSubscriptionCancel({
	subscription,
}: {
	event: Stripe.Event;
	subscription: Subscription;
	stripeSubscription: Stripe.Subscription;
	cancellationDetails: Stripe.Subscription.CancellationDetails;
}) {
	// Called when a subscription is canceled
	// await sendCancellationEmail(subscription.referenceId);
	console.log(`Subscription ${subscription.id} cancelled`);
}

export async function onSubscriptionDeleted({
	subscription,
}: {
	event: Stripe.Event;
	subscription: Subscription;
	stripeSubscription: Stripe.Subscription;
}) {
	// Called when a subscription is deleted
	console.log(`Subscription ${subscription.id} deleted`);
}
