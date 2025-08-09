"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useTRPC } from "@/trpc/client";

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

export const InvoicesTable = () => {
	const trpc = useTRPC();
	const t = useTranslations("billing");

	const { data: invoices } = useSuspenseQuery(
		trpc.billing.getInvoices.queryOptions(),
	);

	const columns = useMemo<ColumnDef<InvoiceRow>[]>(
		() => [
			{
				accessorKey: "number",
				header: t("history.invoice"),
				cell: ({ row }) => (
					<div className="flex items-center gap-3">
						<div className="rounded-md border p-1 text-[10px] font-medium">
							{t("history.pdf")}
						</div>
						<span>
							{t("history.invoiceLabel", {
								number: row.original.number ?? row.original.id,
							})}
						</span>
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
								<a
									href={row.original.pdfUrl}
									target="_blank"
								rel="noopener noreferrer"
									title={t("history.download")}
									aria-label={t("history.download")}
								>
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

	return (
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
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell colSpan={columns.length} className="h-32 text-center">
							<div className="flex flex-col items-center justify-center gap-1 py-6 text-muted-foreground">
								<div className="text-sm font-medium">
									{t("history.empty.title")}
								</div>
								<div className="text-xs">{t("history.empty.description")}</div>
							</div>
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
};
