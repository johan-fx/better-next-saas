import { baseTranslations } from "@c15t/translations";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next";
import { routing } from "@/modules/i18n/routing";
import { TRPCReactProvider } from "@/trpc/client";
import "@/styles/globals.css";
import {
	ConsentManagerDialog,
	ConsentManagerProvider,
	CookieBanner,
} from "@c15t/nextjs";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Body } from "@/components/body";
import { env } from "@/lib/env";
import { getQueryClient, trpc } from "@/trpc/server";
import { ClientProviders } from "./providers";

export const metadata: Metadata = {
	title: "Better SaaS Boilerplate",
	description:
		"Your comprehensive platform for managing users and organizations",
};

export const viewport: Viewport = {
	initialScale: 1,
	viewportFit: "cover",
	width: "device-width",
};

type Props = {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
	// Ensure that the incoming `locale` is valid
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	// Enable static rendering
	setRequestLocale(locale);

	const queryClient = getQueryClient();
	void queryClient.prefetchQuery(trpc.auth.socialProviders.queryOptions());

	return (
		<NuqsAdapter>
			<TRPCReactProvider>
				<html lang={locale} suppressHydrationWarning>
					<Body>
						<NextIntlClientProvider>
							<HydrationBoundary state={dehydrate(queryClient)}>
								<ConsentManagerProvider
									options={{
										mode: "c15t",
										backendURL: `${env.NEXT_PUBLIC_API_URL}/api/c15t`,
										consentCategories: ["necessary", "marketing"], // Optional: Specify which consent categories to show in the banner.
										ignoreGeoLocation: true, // Useful for development to always view the banner.
										translations: {
											translations: baseTranslations,
											defaultLanguage: locale,
											disableAutoLanguageSwitch: false,
										},
									}}
								>
									<CookieBanner />
									<ConsentManagerDialog />
									<ClientProviders>{children}</ClientProviders>
								</ConsentManagerProvider>
							</HydrationBoundary>
						</NextIntlClientProvider>
					</Body>
				</html>
			</TRPCReactProvider>
		</NuqsAdapter>
	);
}
