"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Loader2, Radio } from "lucide-react";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn, formatAmountCents } from "@/lib/utils";
import { Link } from "@/modules/i18n/navigation";
import { useTRPC } from "@/trpc/client";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

function PricingTableContent() {
	const t = useTranslations("billing");
	const tCommon = useTranslations("common");
	const trpc = useTRPC();

	// Fetch configured plans (Basic, Plus, Pro) with Stripe prices
	const { data: plans } = useSuspenseQuery(
		trpc.billing.getPlans.queryOptions(),
	);

	// Free plan features from translations
	const freeFeatures = Object.values(
		(t.raw("plans.free.features") ?? {}) as Record<string, string>,
	);

	// Helper to get translation key per plan name
	const getPlanKey = (name: string) => {
		const key = name?.toLowerCase();
		if (key === "basic") return "plans.basic";
		if (key === "plus") return "plans.plus";
		if (key === "pro") return "plans.pro";
		return "plans.basic";
	};

	return (
		<section className="py-16 md:py-32">
			<div className="mx-auto max-w-6xl px-6">
				<div className="mx-auto max-w-2xl space-y-6 text-center">
					<h1 className="text-center text-4xl font-semibold lg:text-5xl">
						Pricing that Scales with You
					</h1>
					<p>
						Gemini is evolving to be more than just the models. It supports an
						entire to the APIs and platforms helping developers and businesses
						innovate.
					</p>
				</div>

				<div className="mt-8 grid gap-4 md:mt-20 md:grid-cols-2 lg:grid-cols-4">
					{/* Free plan */}
					<Card className="bg-muted">
						<CardHeader>
							<CardTitle className="h-6">{t("plans.free.name")}</CardTitle>
							<CardDescription className="text-2xl font-semibold flex items-baseline gap-1">
								{formatAmountCents(0, "USD")}
								<span className="text-sm">{t(`monthlyPeriod`)}</span>
							</CardDescription>
							<Button asChild variant="outline" className="mt-4 w-full">
								<Link href="/auth/sign-up">{tCommon("getStarted")}</Link>
							</Button>
						</CardHeader>
						<Separator />
						<CardContent className="space-y-4">
							<ul className="list-outside space-y-3 text-sm">
								{freeFeatures.map((feature) => (
									<li
										key={`free-${feature}`}
										className="flex items-start gap-2"
									>
										<Radio className="h-4 w-4 text-primary mt-0.5" />
										<span className="text-sm text-muted-foreground">
											{feature}
										</span>
									</li>
								))}
							</ul>
						</CardContent>
					</Card>

					{/* Paid plans from TRPC */}
					{plans.map((plan) => {
						const planKey = getPlanKey(plan.name);
						const featuresRaw = t.raw(`${planKey}.features`) as
							| Record<string, string>
							| undefined;
						const features = featuresRaw ? Object.values(featuresRaw) : [];
						const unitAmount = plan.prices?.monthly?.unitAmount ?? 0;
						const currency = (
							plan.prices?.monthly?.currency ?? "USD"
						).toUpperCase();

						return (
							<Card
								key={plan.name}
								className={cn(plan.recommended && "border-primary")}
							>
								<CardHeader>
									<CardTitle className="flex items-center justify-between h-6">
										{t(`${planKey}.name`)}
										{plan.recommended && (
											<Badge variant="secondary">
												{tCommon("recommended")}
											</Badge>
										)}
									</CardTitle>
									<CardDescription className="text-2xl font-semibold flex items-baseline gap-1">
										{formatAmountCents(unitAmount, currency)}
										<span className="text-sm">{t(`monthlyPeriod`)}</span>
									</CardDescription>
									<Button asChild className="mt-4 w-full">
										<Link href="/auth/sign-up">{tCommon("getStarted")}</Link>
									</Button>
								</CardHeader>
								<Separator />
								<CardContent className="space-y-4">
									<ul className="list-outside space-y-3 text-sm">
										{features.map((feature) => (
											<li
												key={`${plan.name}-${feature}`}
												className="flex items-start gap-2"
											>
												<Radio className="h-4 w-4 text-primary mt-0.5" />
												<span className="text-sm text-muted-foreground">
													{feature}
												</span>
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>
		</section>
	);
}

export default function PricingTable() {
	return (
		<Suspense
			fallback={
				<section className="py-16 md:py-32">
					<div className="mx-auto max-w-6xl px-6">
						<Loader2 className="animate-spin" />
					</div>
				</section>
			}
		>
			<PricingTableContent />
		</Suspense>
	);
}
