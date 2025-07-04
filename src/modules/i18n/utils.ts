import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { getTranslations } from "next-intl/server";
import {
	defaultLocale,
	type SupportedLocale,
	supportedLocales,
} from "./routing";

/**
 * Check if a locale is supported for the app
 */
export function isLocaleSupported(
	locale: string,
): locale is (typeof supportedLocales)[number] {
	return supportedLocales.includes(locale as (typeof supportedLocales)[number]);
}

/**
 * Internationalization helper
 *
 * Since the app is rendered outside of the normal Next.js request cycle,
 * we need to manually load translations for the specified locale.
 */
export async function getLocaleTranslations(locale: string, namespace: string) {
	try {
		// Load translations for the specified locale and namespace
		return await getTranslations({ locale, namespace });
	} catch (error) {
		console.error(`Failed to load translations for locale ${locale}:`, error);
		// Fallback to English if translation loading fails
		return await getTranslations({ locale: defaultLocale, namespace });
	}
}

/**
 * Get the user's preferred locale or fallback to English
 */
export function getUserLocale(userPreferences?: { locale?: string }): string {
	return userPreferences?.locale ?? defaultLocale;
}

export const resolveLocaleFromHeaders = (
	reqHeaders: Headers,
): SupportedLocale => {
	const headers = Object.fromEntries(reqHeaders.entries());
	const negotiator = new Negotiator({ headers });
	const acceptedLanguages = negotiator.languages();

	const matchedLocale = matchLocale(
		acceptedLanguages,
		supportedLocales,
		defaultLocale,
	);

	return matchedLocale as SupportedLocale;
};
