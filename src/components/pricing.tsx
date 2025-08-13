"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Loader2, Radio } from "lucide-react";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { formatAmountCents } from "@/lib/utils";
import { Link } from "@/modules/i18n/navigation";
import { useTRPC } from "@/trpc/client";

// Separated content that uses Suspense hooks to keep the parent simple
function PricingContent() {
	const t = useTranslations("billing");
	const tCommon = useTranslations("common");
	const trpc = useTRPC();

	const paidPlanName = "basic";

	// Fetch live plans (Plus/Pro/Basic) with Stripe prices
	const { data: plans } = useSuspenseQuery(
		trpc.billing.getPlans.queryOptions(),
	);

	const plusPlan = plans.find((p) => p.name?.toLowerCase() === paidPlanName);
	const plusMonthly = plusPlan?.prices?.monthly;
	const plusPriceText = formatAmountCents(
		plusMonthly?.unitAmount ?? 0,
		(plusMonthly?.currency ?? "USD").toUpperCase(),
	);

	// Localized features (same approach as in plans-cards)
	const freeFeatures = Object.values(
		(t.raw("plans.free.features") ?? {}) as Record<string, string>,
	);
	const plusFeatures = Object.values(
		(t.raw(`plans.${paidPlanName}.features`) ?? {}) as Record<string, string>,
	);

	return (
		<section className="py-16 md:py-32">
			<div className="mx-auto max-w-5xl px-6">
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

				<div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-5 md:gap-0">
					{/* Free plan card - translated name, fixed $0 */}
					<div className="rounded-(--radius) bg-muted flex flex-col justify-between space-y-8 border p-6 md:col-span-2 md:my-2 md:rounded-r-none md:border-r-0 lg:p-10">
						<div className="space-y-4">
							<div>
								{/* Use translations from billing.plans.free */}
								<h2 className="font-medium">{t("plans.free.name")}</h2>
								<span className="my-3 block text-2xl font-semibold">
									{formatAmountCents(0, "USD")} {t("monthlyPeriod")}
								</span>
							</div>

							<Button asChild variant="outline" className="w-full">
								<Link href="/auth/sign-up">{tCommon("getStarted")}</Link>
							</Button>

							<hr className="border-dashed" />

							<ul className="list-outside space-y-3 text-sm">
								{freeFeatures.map((feature) => (
									<li
										key={`free-${feature}`}
										className="flex items-center gap-2"
									>
										<Radio className="h-4 w-4 text-primary" />
										<span className="text-sm text-muted-foreground">
											{feature}
										</span>
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Plus plan card - translated name, live price from TRPC */}
					<div className="dark:bg-muted rounded-(--radius) border p-6 shadow-lg shadow-gray-950/5 md:col-span-3 lg:p-12 dark:[--color-muted:var(--color-zinc-900)]">
						<div className="grid gap-6 sm:grid-cols-2">
							<div className="space-y-4">
								<div>
									{/* Use translations from billing.plans.plus */}
									<h2 className="font-medium">
										{t(`plans.${paidPlanName}.name`)}
									</h2>
									<span className="my-3 block text-2xl font-semibold">
										{plusPriceText} {t("monthlyPeriod")}
									</span>
								</div>

								<Button asChild className="w-full">
									<Link href="/auth/sign-up">{tCommon("getStarted")}</Link>
								</Button>
							</div>

							<div>
								<div className="text-sm font-medium">
									Everything in free plus :
								</div>

								<ul className="mt-4 list-outside space-y-3 text-sm">
									{plusFeatures.map((feature) => (
										<li
											key={`plus-${feature}`}
											className="flex items-center gap-2"
										>
											<Radio className="h-4 w-4 text-primary" />
											<span className="text-sm text-muted-foreground">
												{feature}
											</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default function Pricing() {
	// Provide a Suspense boundary for the TRPC/React Query suspense hooks
	return (
		<Suspense
			fallback={
				<section className="py-16 md:py-32">
					<div className="mx-auto max-w-5xl px-6">
						<Loader2 className="animate-spin" />
					</div>
				</section>
			}
		>
			<PricingContent />
		</Suspense>
	);
}
