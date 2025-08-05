import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next";
import { routing } from "@/modules/i18n/routing";
import { TRPCReactProvider } from "@/trpc/client";
import "@/styles/globals.css";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { Body } from "@/components/body";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { getQueryClient, trpc } from "@/trpc/server";
import { ClientProviders } from "./providers";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

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
								<ClientProviders>{children}</ClientProviders>
							</HydrationBoundary>
						</NextIntlClientProvider>
					</Body>
				</html>
			</TRPCReactProvider>
		</NuqsAdapter>
	);
}
