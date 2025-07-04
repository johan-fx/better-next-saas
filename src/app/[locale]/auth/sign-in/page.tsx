import { setRequestLocale } from "next-intl/server";
import { SigninView } from "@/modules/auth/ui/views/signin-view";

type Props = {
	params: Promise<{ locale: string }>;
};

/**
 * Sign In Page
 *
 * Public page for user authentication with email and password.
 * Uses the modular approach by delegating functionality to SigninView.
 *
 * Features:
 * - Email/password signin
 * - Error handling for invalid credentials
 * - Email verification requirement handling
 * - Internationalization support
 * - Better Auth integration
 * - Automatic redirect to dashboard on success
 */
export default async function SignInPage({ params }: Props) {
	const { locale } = await params;

	// Enable static rendering for this locale
	setRequestLocale(locale);

	return <SigninView />;
}
