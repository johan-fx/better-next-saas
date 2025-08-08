"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Download, Loader2, Radio } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import type { Plan } from "../../plans";
import { UpgradeSubscriptionButton } from "../components/upgrade-subscription-button";

type InvoiceRow = {
	id: string;
	number?: string;
	date: string; // ISO string
	plan?: string;
	amount: number; // cents
	currency: string; // e.g. USD
	pdfUrl?: string;
	hostedUrl?: string;
	status?: string | null;
};

function formatAmountCents(amount: number, currency: string) {
	try {
		return new Intl.NumberFormat(undefined, {
			style: "currency",
			currency,
			currencyDisplay: "narrowSymbol",
		}).format((amount ?? 0) / 100);
	} catch {
		return `$${(amount / 100).toFixed(2)}`;
	}
}

export const BillingView = () => {
	const trpc = useTRPC();
	const t = useTranslations("billing");

	const { data: plans } = useSuspenseQuery(
		trpc.billing.getPlans.queryOptions(),
	);

	const { data: activeSubscription } = useSuspenseQuery(
		trpc.billing.getActiveSubscription.queryOptions(),
	);

	const { data: invoices } = useSuspenseQuery(
		trpc.billing.getInvoices.queryOptions(),
	);

	const isCurrentPlan = (plan: Plan) => {
		return activeSubscription?.plan?.toLowerCase() === plan.name.toLowerCase();
	};

	const getButtonText = (plan: Plan) => {
		if (isCurrentPlan(plan)) {
			return t("buttons.current");
		} else if (Number(activeSubscription?.id ?? 0) > Number(plan?.id ?? 0)) {
			return t("buttons.downgrade");
		}
		return t("buttons.upgrade");
	};

	const columns = useMemo<ColumnDef<InvoiceRow>[]>(
		() => [
			{
				accessorKey: "number",
				header: t("history.invoice"),
				cell: ({ row }) => (
					<div className="flex items-center gap-3">
						<div className="rounded-md border p-1 text-[10px] font-medium">
							PDF
						</div>
						<span>Invoice {row.original.number ?? row.original.id}</span>
					</div>
				),
			},
			{
				accessorKey: "date",
				header: t("history.date"),
				cell: ({ getValue }) => {
					const date = new Date(String(getValue()));
					return date.toLocaleDateString();
				},
			},
			{
				accessorKey: "plan",
				header: t("history.plan"),
				cell: ({ row }) => row.original.plan ?? "-",
			},
			{
				accessorKey: "amount",
				header: t("history.amount"),
				cell: ({ row }) =>
					formatAmountCents(row.original.amount, row.original.currency),
			},
			{
				id: "actions",
				header: "",
				cell: ({ row }) => (
					<div className="flex items-center justify-end gap-2">
						{row.original.pdfUrl ? (
							<Button asChild variant="ghost" size="icon" className="h-8 w-8">
								<a href={row.original.pdfUrl} target="_blank" rel="noreferrer">
									<Download className="h-4 w-4" />
								</a>
							</Button>
						) : null}
					</div>
				),
			},
		],
		[t],
	);

	const table = useReactTable({
		data: (invoices ?? []) as InvoiceRow[],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const planKeyMap: Record<string, string> = {
		free: "plans.free",
		basic: "plans.basic",
		plus: "plans.plus",
		pro: "plans.pro",
	};

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				{plans.map((plan) => {
					const key = (plan.name || "").toLowerCase();
					const planKey =
						planKeyMap[key as keyof typeof planKeyMap] ?? "plans.basic";
					const planT = (sub: string) => t(`${planKey}.${sub}`);
					const rawFeatures = t.raw(`${planKey}.features`);
					const features: string[] = rawFeatures
						? Object.values(rawFeatures)
						: [];
					const isCurrent = isCurrentPlan(plan);
					return (
						<Card
							key={plan.name}
							className={cn("!pb-0", isCurrent ? "border-primary" : undefined)}
						>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span>{planT("name")}</span>
									{isCurrent ? (
										<Badge variant="secondary">{t("buttons.current")}</Badge>
									) : null}
								</CardTitle>
								<CardDescription className="text-lg font-semibold">
									{formatAmountCents(
										plan.price?.unitAmount ?? 0,
										plan.price?.currency ?? "USD",
									)}
									{t("perMonth")}
								</CardDescription>
							</CardHeader>
							<Separator />
							<CardContent className="space-y-3 pt-4 grow">
								{features?.map((f) => (
									<div
										key={`${plan.name}-${f}`}
										className="flex items-center gap-2"
									>
										<Radio className="h-4 w-4 text-primary" />
										<span className="text-sm text-muted-foreground">{f}</span>
									</div>
								))}
							</CardContent>
							<CardFooter className="p-4">
								<UpgradeSubscriptionButton
									plan={plan}
									buttonText={getButtonText(plan)}
									disabled={isCurrent}
								/>
							</CardFooter>
						</Card>
					);
				})}
			</div>

			<div className="space-y-4">
				<div className="text-base font-medium">{t("history.title")}</div>
				<div className="rounded-xl border">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										<div className="flex items-center justify-center gap-2 text-muted-foreground">
											<Loader2 className="h-4 w-4 animate-spin" />
											{t("history.title")}
										</div>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
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
