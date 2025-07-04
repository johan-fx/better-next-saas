"use client";

import { useParams } from "next/navigation";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/modules/i18n/navigation";

const languages = [
	{ code: "en", name: "English", flag: "🇺🇸" },
	{ code: "es", name: "Español", flag: "🇪🇸" },
];

export function LanguageSwitcher() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams();
	const [isPending, startTransition] = useTransition();

	const currentLocale = params.locale as string;

	const handleLanguageChange = (newLocale: string) => {
		startTransition(() => {
			// Navigate to the same page but with different locale
			router.replace(pathname, { locale: newLocale });
		});
	};

	return (
		<div className="relative inline-block">
			<select
				value={currentLocale}
				onChange={(e) => handleLanguageChange(e.target.value)}
				disabled={isPending}
				className="appearance-none bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
				aria-label="Select language"
			>
				{languages.map((lang) => (
					<option key={lang.code} value={lang.code}>
						{lang.flag} {lang.name}
					</option>
				))}
			</select>

			{/* Custom dropdown arrow */}
			<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
				<svg
					className="fill-current h-4 w-4"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					aria-hidden="true"
				>
					<path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
				</svg>
			</div>

			{isPending && (
				<div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 rounded-md">
					<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
				</div>
			)}
		</div>
	);
}
