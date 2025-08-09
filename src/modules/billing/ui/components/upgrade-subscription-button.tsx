"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/client";
import { BillingPeriod, type Plan } from "../../plans";

interface Props {
	buttonText: string;
	plan: Plan;
	disabled?: boolean;
	loading?: boolean;
	period: BillingPeriod;
}

export const UpgradeSubscriptionButton = ({
	buttonText,
	plan,
	disabled,
	loading,
	period,
}: Props) => {
	const t = useTranslations("billing");
	const trpc = useTRPC();
	const { data: organization, isPending } = authClient.useActiveOrganization();
	const { data: activeSubscription } = useSuspenseQuery(
		trpc.billing.getActiveSubscription.queryOptions(),
	);

	const isCurrentPlan =
		activeSubscription?.plan?.toLowerCase() === plan.name.toLowerCase();

	const handleSubscribe = async () => {
		try {
			if (isCurrentPlan) {
				const { data, error } = await authClient.subscription.billingPortal({
					referenceId: organization?.id,
					returnUrl: "/account/billing",
				});
				if (error) {
					console.log(error);
				}
				if (data?.url) {
					window.location.href = data.url as string;
				}
				return;
			}

			// Not current plan → proceed with upgrade/switch flow
			const { data, error } = await authClient.subscription.upgrade({
				plan: plan.name.toLowerCase(),
				successUrl: "/account/billing",
				cancelUrl: "/account/billing",
				returnUrl: "/account/billing",
				referenceId: organization?.id,
				subscriptionId: activeSubscription?.stripeSubscriptionId,
				annual: period === BillingPeriod.YEARLY,
			});
			if (error) {
				console.log(error);
			}
			if (data?.url) {
				window.location.href = data.url as string;
			}
		} catch (err) {
			console.log(err);
		}
	};
	return (
		<Button
			onClick={handleSubscribe}
			className="w-full"
			disabled={isPending || disabled || loading || !organization?.id}
			variant={isCurrentPlan ? "outline" : "default"}
		>
			{isPending || loading ? (
				<Loader2 className="mr-2 size-4 animate-spin" />
			) : (
				(buttonText ?? t("buttons.upgrade"))
			)}
		</Button>
	);
};
