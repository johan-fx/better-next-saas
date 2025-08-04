"use client";

import { Loader2 } from "lucide-react";
import { useLocale } from "next-intl";
import { useTransition } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "@/modules/i18n/navigation";

const languages = [
	{ code: "en", name: "English", flag: "🇺🇸" },
	{ code: "es", name: "Español", flag: "🇪🇸" },
];

export function LanguageSwitcher() {
	const router = useRouter();
	const pathname = usePathname();
	const currentLocale = useLocale();
	const [isPending, startTransition] = useTransition();

	const handleLanguageChange = (newLocale: string) => {
		startTransition(() => {
			router.replace(pathname, { locale: newLocale });
		});
	};

	const currentLanguage = languages.find((lang) => lang.code === currentLocale);

	return (
		<Select
			value={currentLocale}
			onValueChange={handleLanguageChange}
			disabled={isPending}
		>
			<SelectTrigger className="w-fit" aria-label="Select language">
				<SelectValue>
					{currentLanguage && (
						<span className="flex items-center gap-2">
							{isPending && <Loader2 className="h-4 w-4 animate-spin" />}
							<span>{currentLanguage.name}</span>
						</span>
					)}
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{languages.map((lang) => (
					<SelectItem key={lang.code} value={lang.code}>
						<span>{lang.name}</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
