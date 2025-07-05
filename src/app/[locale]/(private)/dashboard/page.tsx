import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
	params: Promise<{ locale: string }>;
};

/**
 * Dashboard Page
 *
 * Main dashboard page for authenticated users.
 * This page is now protected by the private layout wrapper.
 * Users must be authenticated to access this page.
 */
export default async function DashboardPage({ params }: Props) {
	const { locale } = await params;

	// Enable static rendering for this locale
	setRequestLocale(locale);

	// Get translations
	const t = await getTranslations("Dashboard");

	return (
		<div className="flex-1 space-y-4 p-8 pt-6">
			<div className="flex items-center justify-between space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
			</div>
			<div className="space-y-4">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{/* Dashboard content will be expanded here */}
					<div className="rounded-lg border p-4">
						<h3 className="font-semibold">{t("overview")}</h3>
						<p className="text-sm text-muted-foreground mt-2">
							{t("welcome")} - This is your dashboard!
						</p>
					</div>
					<div className="rounded-lg border p-4">
						<h3 className="font-semibold">{t("projects")}</h3>
						<p className="text-sm text-muted-foreground mt-2">
							Manage your projects here
						</p>
					</div>
					<div className="rounded-lg border p-4">
						<h3 className="font-semibold">{t("tasks")}</h3>
						<p className="text-sm text-muted-foreground mt-2">
							Track your tasks and progress
						</p>
					</div>
					<div className="rounded-lg border p-4">
						<h3 className="font-semibold">{t("team")}</h3>
						<p className="text-sm text-muted-foreground mt-2">
							Collaborate with your team
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
