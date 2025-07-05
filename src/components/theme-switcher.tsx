"use client";

import { LaptopMinimalIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ThemeSwitcher() {
	const { theme, setTheme } = useTheme();
	const t = useTranslations("Common");

	// Get the appropriate icon based on current theme
	const getThemeIcon = () => {
		switch (theme) {
			case "light":
				return <SunIcon className="h-4 w-4" />;
			case "dark":
				return <MoonIcon className="h-4 w-4" />;
			// case "system":
			default:
				return <LaptopMinimalIcon className="h-4 w-4" />;
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button size="icon" variant="outline">
					{getThemeIcon()}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setTheme("light")}>
					<SunIcon className="h-4 w-4 mr-2" />
					{t("lightTheme")}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("system")}>
					<LaptopMinimalIcon className="h-4 w-4 mr-2" />
					{t("systemTheme")}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("dark")}>
					<MoonIcon className="h-4 w-4 mr-2" />
					{t("darkTheme")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
