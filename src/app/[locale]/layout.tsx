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

// Tailwind theme to align c15t components with shadcn/ui aesthetics
// References:
// - Cookie Banner: https://c15t.com/docs/components/react/cookie-banner
// - Consent Manager Dialog: https://c15t.com/docs/components/react/consent-manager-dialog
const BUTTON_SHARED_CLASSES =
	"!text-sm !border !shadow-xs !outline-none focus-visible:!border-ring focus-visible:!ring-ring/50 focus-visible:!ring-[3px] aria-invalid:!ring-destructive/20 dark:aria-invalid:!ring-destructive/40 aria-invalid:!border-destructive";

const BUTTON_CLASSES = {
	REJECT: `${BUTTON_SHARED_CLASSES} !border-input !bg-background !text-foreground hover:!bg-accent hover:!text-accent-foreground`,
	ACCEPT: `${BUTTON_SHARED_CLASSES} !bg-primary !text-primary-foreground hover:!bg-primary/90`,
	CUSTOMIZE: `${BUTTON_SHARED_CLASSES} !border-input !bg-background !text-foreground hover:!bg-accent hover:!text-accent-foreground`,
};

const consentManagerTheme = {
	// Cookie Banner (compound theme parts)
	"banner.footer": "!bg-background",
	"banner.footer.reject-button": BUTTON_CLASSES.REJECT,
	"banner.footer.accept-button": BUTTON_CLASSES.ACCEPT,
	"banner.footer.customize-button": BUTTON_CLASSES.CUSTOMIZE,

	// Consent Manager Dialog
	"widget.root": "!bg-background",
	"widget.footer": "!bg-background",
	"widget.footer.reject-button": BUTTON_CLASSES.REJECT,
	"widget.footer.accept-button": BUTTON_CLASSES.ACCEPT,
	"widget.footer.customize-button": BUTTON_CLASSES.CUSTOMIZE,
	"widget.footer.save-button": BUTTON_CLASSES.CUSTOMIZE,
	"dialog.footer": "!hidden",
	"dialog.description": "!text-sm",
	"dialog.title": "!text-lg",
	"widget.switch": "data-[state=checked]:[&_>div]:!bg-primary",
	"widget.accordion.trigger-inner":
		"!gap-x-3 [&_svg]:!scale-75 [&_svg]:!-translate-y-0.5",
} as const;

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
										ignoreGeoLocation: env.NODE_ENV !== "production", // Useful for development to always view the banner.
										translations: {
											translations: {
												[locale]: baseTranslations[locale],
											},
											defaultLanguage: locale,
											disableAutoLanguageSwitch: true,
										},
									}}
								>
									<CookieBanner theme={consentManagerTheme} />
									<ConsentManagerDialog theme={consentManagerTheme} />
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
