"use client";

import { Link } from "@/modules/i18n/navigation";
import { LanguageSwitcher } from "@/modules/i18n/ui/components/language-switcher";
import { Logo } from "./logo";
import ThemeSwitcher from "./theme-switcher";

/**
 * PublicHeader Component
 *
 * Header component for public/unauthenticated pages that includes:
 * - App branding/logo
 * - Language switcher for internationalization
 * - Theme switcher for dark/light mode
 * - Clean, responsive design
 */
export function PublicHeader() {
	return (
		<header className="sticky top-0 z-50 flex h-14 justify-between border-b bg-background/60 px-safe-or-4 backdrop-blur md:px-safe-or-6">
			<div className="flex flex-1 h-14 items-center justify-between px-4">
				{/* Logo/Brand */}
				<div className="flex items-center space-x-2">
					<Link href="/" className="flex items-center space-x-2">
						<Logo />
					</Link>
				</div>

				{/* Navigation Controls */}
				<div className="flex items-center space-x-2">
					<LanguageSwitcher />
					<ThemeSwitcher />
				</div>
			</div>
		</header>
	);
}
