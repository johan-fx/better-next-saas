import { setRequestLocale } from "next-intl/server";
import ContentSection from "@/components/content-7";
import Features from "@/components/features-1";
import FooterSection from "@/components/footer";
import HeroSection from "@/components/hero-section";
import IntegrationsSection from "@/components/integrations-4";
import Pricing from "@/components/pricing";

type Props = {
	params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
	const { locale } = await params;

	// Enable static rendering
	setRequestLocale(locale);

	return (
		<div>
			<HeroSection />
			<div id="features">
				<Features />
			</div>
			<div id="solution">
				<ContentSection />
			</div>
			<div id="integrations">
				<IntegrationsSection />
			</div>
			<div id="pricing">
				<Pricing />
			</div>
			<FooterSection />
		</div>
	);
}
