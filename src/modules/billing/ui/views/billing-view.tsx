"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import type { Plan } from "../../plans";
import { UpgradeSubscriptionButton } from "../components/upgrade-subscription-button";

export const BillingView = () => {
	const trpc = useTRPC();

	const { data: plans } = useSuspenseQuery(
		trpc.billing.getPlans.queryOptions(),
	);

	const { data: activeSubscription } = useSuspenseQuery(
		trpc.billing.getActiveSubscription.queryOptions(),
	);

	const isCurrentPlan = (plan: Plan) => {
		return activeSubscription?.plan?.toLowerCase() === plan.name.toLowerCase();
	};

	const getButtonText = (plan: Plan) => {
		if (isCurrentPlan(plan)) {
			return "Current Plan";
		} else if (Number(activeSubscription?.id) > plan.id) {
			return "Downgrade";
		}
		return "Upgrade";
	};

	return (
		<div>
			{plans.map((plan) => (
				<div key={plan.name}>
					<div>{plan.name}</div>
					<UpgradeSubscriptionButton
						plan={plan}
						buttonText={getButtonText(plan)}
						disabled={isCurrentPlan(plan)}
					/>
				</div>
			))}
		</div>
	);
};

export const BillingViewLoading = () => {
	return <div>BillingViewLoading</div>;
};

export const BillingViewError = () => {
	return <div>BillingViewError</div>;
};
