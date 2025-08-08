import { useTranslations } from "next-intl";
import { InvoicesTable } from "../components/invoices-table";
import { PlansCards } from "../components/plans-cards";

export const BillingView = () => {
	const t = useTranslations("billing");

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
			<PlansCards />

			<div className="space-y-4">
				<div className="text-base font-medium">{t("history.title")}</div>
				<div className="rounded-xl border">
					<InvoicesTable />
				</div>
			</div>
		</div>
	);
};

export const BillingViewLoading = () => {
	return <div className="h-[400px] w-full animate-pulse rounded-xl border" />;
};

export const BillingViewError = () => {
	return <div className="text-destructive">Error loading billing</div>;
};
