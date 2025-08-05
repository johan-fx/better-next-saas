import { setRequestLocale } from "next-intl/server";

type Props = {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
};

/**
 * Public Layout Component
 *
 * This layout wraps all public/unauthenticated sections of the app.
 * It provides:
 * - Public header with theme switcher and language switcher
 * - Clean layout structure for public pages
 * - Internationalization support
 */
export default async function PublicLayout({ children, params }: Props) {
	const { locale } = await params;

	// Enable static rendering for this locale
	setRequestLocale(locale);

	return <>{children}</>;
}
