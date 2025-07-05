import { defineRouting } from "next-intl/routing";

/**
 * Supported locales for the app
 */
export const supportedLocales = ["en", "es"] as const;

export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale =
	(process.env.APP_DEFAULT_LOCALE as SupportedLocale) ?? "en";

/**
 * Routing configuration for the app
 */
export const routing = defineRouting({
	// A list of all locales that are supported
	locales: supportedLocales,

	// Used when no locale matches
	defaultLocale,
});
