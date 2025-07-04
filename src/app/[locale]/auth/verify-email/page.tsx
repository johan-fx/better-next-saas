import { setRequestLocale } from "next-intl/server";
import { VerifyEmailView } from "@/modules/auth/ui/views/verify-email-view";

type Props = {
	params: Promise<{ locale: string }>;
};

/**
 * Email Verification Page
 *
 * Page shown to users after successful signup to inform them
 * about email verification requirement.
 *
 * Following module development patterns:
 * - Page only imports and renders the view component
 * - Business logic and UI components are contained in the view
 */
export default async function VerifyEmailPage({ params }: Props) {
	const { locale } = await params;

	// Enable static rendering for this locale
	setRequestLocale(locale);

	return <VerifyEmailView />;
}
