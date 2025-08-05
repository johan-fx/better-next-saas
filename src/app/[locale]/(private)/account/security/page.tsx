import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import { setRequestLocale } from "next-intl/server";
import { SecurityView } from "@/modules/auth/ui/views/security-view";

type Props = {
	params: Promise<{ locale: string }>;
};

export default async function AccountSecurityPage({ params }: Props) {
	const { locale } = await params;

	// Enable static rendering for this locale
	setRequestLocale(locale);

	return (
		<div className="container flex grow flex-col p-4 md:p-6">
			<RedirectToSignIn />
			<SignedIn>
				<SecurityView />
			</SignedIn>
		</div>
	);
}
