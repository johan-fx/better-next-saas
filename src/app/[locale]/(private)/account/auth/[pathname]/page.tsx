import { SettingsCards } from "@daveyplate/better-auth-ui";
import { setRequestLocale } from "next-intl/server";

type Props = {
	params: Promise<{ locale: string; pathname: string }>;
};

export default async function SettingsPage({ params }: Props) {
	const { locale, pathname } = await params;

	// Enable static rendering for this locale
	setRequestLocale(locale);

	return (
		<div className="container flex grow flex-col  gap-4 p-4 md:p-6">
			<SettingsCards pathname={pathname} />
		</div>
	);
}
