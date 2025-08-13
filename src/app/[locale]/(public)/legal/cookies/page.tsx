import { getTranslations } from "next-intl/server";
import FooterSection from "@/components/footer";
import { HeroHeader } from "@/components/header";
import { OpenPrivacySettingsButton } from "@/components/open-privacy-settings-button";
import { Badge } from "@/components/ui/badge";
import { env } from "@/lib/env";

export default async function CookiesPage() {
	const t = await getTranslations("legal.cookies");
	const supportEmail = env.APP_SUPPORT_EMAIL ?? "support@example.com";

	const types =
		(t.raw("sections.types.items") as Array<{
			name: string;
			desc: string;
			badge: string;
		}>) ?? [];

	const howBullets = (t.raw("sections.howWeUse.bullets") as string[]) ?? [];

	return (
		<div>
			<HeroHeader />
			<main className="overflow-hidden">
				<section>
					<div className="relative py-16 md:py-24 text-sm">
						<div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]" />
						<div className="mx-auto max-w-5xl px-6">
							<div className="space-y-3">
								<div className="py-4">
									<h1 className="py-4 text-4xl font-bold md:text-5xl">
										{t("title")}
									</h1>
									<p className="text-sm text-muted-foreground max-w-3xl">
										{t("intro")}
									</p>
								</div>
								<div className="flex items-center gap-3 pt-2">
									<Badge variant="outline">{t("meta.lastUpdated")}</Badge>
									<span className="text-sm text-muted-foreground">
										{t("meta.effective")}
									</span>
								</div>
							</div>

							<div className="mt-10 space-y-10">
								<div className="space-y-3">
									<h2 className="text-xl font-semibold">
										{t("sections.whatAreCookies.title")}
									</h2>
									<p className="text-muted-foreground">
										{t("sections.whatAreCookies.p1")}
									</p>
								</div>

								<div className="space-y-3">
									<h2 className="text-xl font-semibold">
										{t("sections.howWeUse.title")}
									</h2>
									<ul className="list-disc space-y-1 pl-6 text-muted-foreground">
										{howBullets.map((item) => (
											<li key={item}>{item}</li>
										))}
									</ul>
								</div>

								<div className="space-y-3">
									<h2 className="text-xl font-semibold">
										{t("sections.types.title")}
									</h2>
									<div className="grid gap-4 md:grid-cols-2">
										{types.map((type) => (
											<div key={type.name} className="rounded-lg border p-4">
												<div className="flex items-center justify-between">
													<h3 className="font-semibold">{type.name}</h3>
													<Badge variant="secondary">{type.badge}</Badge>
												</div>
												<p className="mt-2 text-sm text-muted-foreground">
													{type.desc}
												</p>
											</div>
										))}
									</div>
								</div>

								<div className="space-y-3">
									<h2 className="text-xl font-semibold">
										{t("sections.manage.title")}
									</h2>
									<div className="space-y-3">
										<p className="text-muted-foreground">
											{t("sections.manage.p1")}
										</p>
										<p className="text-muted-foreground">
											{t("sections.manage.p2")}
										</p>
										<OpenPrivacySettingsButton
											label={t("actions.openSettings")}
										/>
										<p className="text-xs text-muted-foreground">
											{t("sections.manage.note")}
										</p>
									</div>
								</div>

								<div className="space-y-3">
									<h2 className="text-xl font-semibold">
										{t("sections.thirdParties.title")}
									</h2>
									<p className="text-muted-foreground">
										{t("sections.thirdParties.p1")}
									</p>
								</div>

								<div className="space-y-3">
									<h2 className="text-xl font-semibold">
										{t("sections.retention.title")}
									</h2>
									<p className="text-muted-foreground">
										{t("sections.retention.p1")}
									</p>
								</div>

								<div className="space-y-3">
									<h2 className="text-xl font-semibold">
										{t("sections.contact.title")}
									</h2>
									<p className="text-muted-foreground">
										{t("sections.contact.p1", { email: supportEmail })}
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>
			<FooterSection />
		</div>
	);
}
