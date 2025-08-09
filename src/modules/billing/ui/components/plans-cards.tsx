"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Radio } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { BillingPeriod, type Plan, plans } from "../../plans";
import { UpgradeSubscriptionButton } from "../components/upgrade-subscription-button";

function formatAmountCents(amount: number, currency: string) {
	try {
		return new Intl.NumberFormat(undefined, {
			style: "currency",
			currency,
			currencyDisplay: "narrowSymbol",
		}).format((amount ?? 0) / 100);
	} catch {
		return `$${(amount / 100).toFixed(2)}`;
	}
}

export const PlansCards = ({
	period = BillingPeriod.MONTHLY,
}: {
	period?: BillingPeriod;
}) => {
	const trpc = useTRPC();
	const t = useTranslations("billing");
	const [upgradingPlan, setUpgradingPlan] = useState<Plan | null>(null);

	const { data: plans } = useSuspenseQuery(
		trpc.billing.getPlans.queryOptions(),
	);

	const { data: activeSubscription } = useSuspenseQuery(
		trpc.billing.getActiveSubscription.queryOptions(),
	);

	const currentPlan = plans.find(
		(plan) =>
			plan.name.toLowerCase() === activeSubscription?.plan?.toLowerCase(),
	);

	const isCurrentPlan = (plan: Plan) => {
		return activeSubscription?.plan?.toLowerCase() === plan.name.toLowerCase();
	};

	const getButtonText = (plan: Plan) => {
		if (isCurrentPlan(plan)) {
			return t("buttons.manage");
		} else if ((currentPlan?.id ?? 0) > plan.id) {
			return t("buttons.downgrade");
		}
		return t("buttons.upgrade");
	};

	const handleUpgrade = (plan: Plan | null) => {
		setUpgradingPlan(plan);
	};

	const planKeyMap: Record<string, string> = {
		free: "plans.free",
		basic: "plans.basic",
		plus: "plans.plus",
		pro: "plans.pro",
	};

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
			{plans.map((plan) => {
				const key = (plan.name || "").toLowerCase();
				const planKey =
					planKeyMap[key as keyof typeof planKeyMap] ?? "plans.basic";
				const planT = (sub: string) => t(`${planKey}.${sub}`);
				const rawFeatures = t.raw(`${planKey}.features`);
				const features: string[] = rawFeatures
					? Object.values(rawFeatures)
					: [];
				const isCurrent = isCurrentPlan(plan);
				const unitAmount = plan.prices?.[period]?.unitAmount ?? 0;
				const currency = plan.prices?.[period]?.currency ?? "USD";
				return (
					<Card
						key={plan.name}
						className={cn("!pb-0", isCurrent ? "border-primary" : undefined)}
					>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span>{planT("name")}</span>
								{isCurrent ? (
									<Badge variant="secondary">{t("buttons.current")}</Badge>
								) : null}
							</CardTitle>
							<CardDescription className="text-2xl font-semibold flex items-baseline gap-1">
								{formatAmountCents(unitAmount, currency)}
								<span className="text-sm">{t(`${period}Period`)}</span>
							</CardDescription>
						</CardHeader>
						<Separator />
						<CardContent className="space-y-3 pt-4 grow">
							{features?.map((f) => (
								<div
									key={`${plan.name}-${f}`}
									className="flex items-center gap-2"
								>
									<Radio className="h-4 w-4 text-primary" />
									<span className="text-sm text-muted-foreground">{f}</span>
								</div>
							))}
						</CardContent>
						<CardFooter className="p-4">
							<UpgradeSubscriptionButton
								plan={plan}
								period={period}
								buttonText={getButtonText(plan)}
								onUpgrade={handleUpgrade}
								disabled={!!upgradingPlan}
								loading={upgradingPlan?.id === plan.id}
							/>
						</CardFooter>
					</Card>
				);
			})}
		</div>
	);
};
