import { getTranslations } from "next-intl/server";
import FooterSection from "@/components/footer";
import { HeroHeader } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { env } from "@/lib/env";

export default async function PrivacyPage() {
	const t = await getTranslations("legal.privacy");
	const appName = env.NEXT_PUBLIC_APP_NAME ?? "App";
	const supportEmail = env.APP_SUPPORT_EMAIL ?? "support@example.com";

	const sections = [
		{
			id: "controller",
			title: t("sections.controller.title"),
			paragraphs: [
				t("sections.controller.p1", { appName }),
				t("sections.controller.p2", { email: supportEmail }),
			],
		},
		{
			id: "data",
			title: t("sections.data.title"),
			paragraphs: [t("sections.data.intro")],
			bullets: (t.raw("sections.data.items") as string[]) ?? [],
		},
		{
			id: "purposes",
			title: t("sections.purposes.title"),
			paragraphs: [t("sections.purposes.intro")],
			bullets: (t.raw("sections.purposes.items") as string[]) ?? [],
		},
		{
			id: "legalBases",
			title: t("sections.legalBases.title"),
			paragraphs: [t("sections.legalBases.intro")],
			bullets: (t.raw("sections.legalBases.items") as string[]) ?? [],
		},
		{
			id: "sharing",
			title: t("sections.sharing.title"),
			paragraphs: [t("sections.sharing.p1"), t("sections.sharing.p2")],
			bullets: (t.raw("sections.sharing.items") as string[]) ?? [],
		},
		{
			id: "transfers",
			title: t("sections.transfers.title"),
			paragraphs: [t("sections.transfers.p1")],
		},
		{
			id: "retention",
			title: t("sections.retention.title"),
			paragraphs: [t("sections.retention.p1")],
		},
		{
			id: "rights",
			title: t("sections.rights.title"),
			paragraphs: [t("sections.rights.intro")],
			bullets: (t.raw("sections.rights.items") as string[]) ?? [],
			paragraphs2: [t("sections.rights.outro")],
		},
		{
			id: "cookies",
			title: t("sections.cookies.title"),
			paragraphs: [t("sections.cookies.p1")],
		},
		{
			id: "security",
			title: t("sections.security.title"),
			paragraphs: [t("sections.security.p1")],
		},
		{
			id: "children",
			title: t("sections.children.title"),
			paragraphs: [t("sections.children.p1")],
		},
		{
			id: "changes",
			title: t("sections.changes.title"),
			paragraphs: [t("sections.changes.p1")],
		},
		{
			id: "contact",
			title: t("sections.contact.title"),
			paragraphs: [t("sections.contact.p1", { email: supportEmail })],
		},
	];

	return (
		<div>
			<HeroHeader />
			<main className="overflow-hidden">
				<section>
					<div className="relative py-16 md:py-24">
						<div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]" />
						<div className="mx-auto max-w-5xl px-6 text-sm">
							<div className="space-y-3">
								<div className="py-4">
									<h1 className="py-4 text-4xl font-bold md:text-5xl">
										{t("title")}
									</h1>
									<p className="text-sm text-muted-foreground max-w-3xl">
										{t("intro", { appName })}
									</p>
								</div>
								<div className="flex items-center gap-3 pt-2">
									<Badge variant="outline">{t("meta.lastUpdated")}</Badge>
									<span className="text-sm text-muted-foreground">
										{t("meta.effective")}
									</span>
								</div>
							</div>

							{/* Render each section as a simple expanded block with a heading.
						   Replaces the previous Accordion for better readability and simpler UI. */}
							<div className="mt-10 space-y-8">
								{sections.map((section) => (
									<div key={section.id} className="py-2">
										<h2 className="text-xl font-semibold">{section.title}</h2>
										<div className="mt-3 space-y-2">
											{section.paragraphs?.map((p) => (
												<p
													key={`${section.id}-p-${p}`}
													className="text-muted-foreground"
												>
													{p}
												</p>
											))}
											{section.bullets && section.bullets.length > 0 && (
												<ul className="list-disc space-y-1 pl-6 text-muted-foreground">
													{section.bullets.map((item) => (
														<li key={`${section.id}-b-${item}`}>{item}</li>
													))}
												</ul>
											)}
											{section.paragraphs2?.map((p) => (
												<p
													key={`${section.id}-p2-${p}`}
													className="text-muted-foreground"
												>
													{p}
												</p>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</section>
			</main>
			<FooterSection />
		</div>
	);
}
