import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import { Organization } from "better-auth/plugins";
import { headers } from "next/headers";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { AccountView } from "@/modules/auth/ui/views/account-view";

type Props = {
	params: Promise<{ locale: string }>;
};

export default async function AccountPage({ params }: Props) {
	const { locale } = await params;

	// Enable static rendering for this locale
	setRequestLocale(locale);

	// Check authentication status using Better Auth
	const sessionData = await auth.api.getSession({
		headers: await headers(),
	});

	if (!sessionData?.session?.activeOrganizationId) {
		const organizations = await auth.api.listOrganizations({
			headers: await headers(),
		});

		const defaultOrganization = organizations.find((org: Organization) => {
			const metadata = JSON.parse(org.metadata ?? "{}");
			return metadata.isDefault;
		});

		if (defaultOrganization) {
			await auth.api.setActiveOrganization({
				body: {
					organizationId: defaultOrganization.id,
				},
				headers: await headers(),
			});
		}
	}

	return (
		<div className="container flex grow flex-col p-4 md:p-6">
			<RedirectToSignIn />
			<SignedIn>
				<AccountView />
			</SignedIn>
		</div>
	);
}
