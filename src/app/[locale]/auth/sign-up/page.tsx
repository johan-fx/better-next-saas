import { setRequestLocale } from "next-intl/server";
import { SignupView } from "@/modules/auth/ui/views/signup-view";

type Props = {
	params: Promise<{ locale: string }>;
};

/**
 * Sign Up Page
 *
 * Public page for user registration with email and password.
 * Uses the modular approach by delegating functionality to SignupView.
 *
 * Features:
 * - Email/password signup
 * - Organization creation
 * - Internationalization support
 * - Better Auth integration
 */
export default async function SignUpPage({ params }: Props) {
	const { locale } = await params;

	// Enable static rendering for this locale
	setRequestLocale(locale);

	return <SignupView />;
}
