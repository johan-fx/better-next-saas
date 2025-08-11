import FAQsThree from "@/components/faqs-3";
import FooterSection from "@/components/footer";
import { HeroHeader } from "@/components/header";
import PricingTable from "@/components/pricing-table";

export default function PricingPage() {
	return (
		<div>
			<HeroHeader />
			<main className="overflow-hidden">
				<section>
					<div className="relative text-sm">
						<PricingTable />
					</div>
					<FAQsThree />
				</section>
			</main>
			<FooterSection />
		</div>
	);
}
