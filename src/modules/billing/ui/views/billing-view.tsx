"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BillingPeriod } from "../../plans";
import { InvoicesTable } from "../components/invoices-table";
import { PlansCards } from "../components/plans-cards";

export const BillingView = () => {
	const t = useTranslations("billing");
	const [period, setPeriod] = useState<BillingPeriod>(BillingPeriod.MONTHLY);

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
			<div className="flex flex-col gap-y-6">
				<div className="flex justify-center">
					<Tabs
						value={period}
						onValueChange={(val) => setPeriod(val as BillingPeriod)}
					>
						<TabsList>
							<TabsTrigger value="monthly" className="flex-1">
								{t("monthly")}
							</TabsTrigger>
							<TabsTrigger value="yearly" className="flex-1">
								{t("yearly")}
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
				<PlansCards period={period} />
			</div>

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
