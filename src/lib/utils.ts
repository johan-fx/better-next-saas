import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Format Stripe amount (in cents) to localized currency string
export function formatAmountCents(amount: number, currency: string) {
	try {
		return new Intl.NumberFormat(undefined, {
			style: "currency",
			currency,
			currencyDisplay: "narrowSymbol",
		}).format((amount ?? 0) / 100);
	} catch {
		return `$${((amount ?? 0) / 100).toFixed(2)}`;
	}
}
