import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
	BillingView,
	BillingViewError,
	BillingViewLoading,
} from "@/modules/billing/ui/views/billing-view";
import { getQueryClient, trpc } from "@/trpc/server";

type Props = {
	params: Promise<{ locale: string }>;
};

export default async function BillingPage({ params }: Props) {
	const { locale } = await params;

	// Enable static rendering for this locale
	setRequestLocale(locale);

	const queryClient = getQueryClient();
	void queryClient.prefetchQuery(
		trpc.billing.getActiveSubscription.queryOptions(),
	);
	void queryClient.prefetchQuery(trpc.billing.getPlans.queryOptions());

	return (
		<div className="container flex grow flex-col p-4 md:p-6">
			<RedirectToSignIn />
			<SignedIn>
				<HydrationBoundary state={dehydrate(queryClient)}>
					<Suspense fallback={<BillingViewLoading />}>
						<ErrorBoundary fallback={<BillingViewError />}>
							<BillingView />
						</ErrorBoundary>
					</Suspense>
				</HydrationBoundary>
			</SignedIn>
		</div>
	);
}
