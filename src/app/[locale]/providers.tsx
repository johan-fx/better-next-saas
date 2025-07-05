"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useAuthUILocalizations } from "@/modules/auth/hooks/use-auth-ui-localizations";

export function Providers({ children }: { children: ReactNode }) {
	const router = useRouter();

	// Get all authUI translations using the custom hook
	const localization = useAuthUILocalizations();

	return (
		<ThemeProvider attribute="class" disableTransitionOnChange>
			<AuthUIProvider
				authClient={authClient}
				navigate={router.push}
				replace={router.replace}
				redirectTo="/account/auth/settings"
				settings={{
					url: "/account/auth/settings",
					basePath: "/account/auth/",
				}}
				onSessionChange={() => {
					router.refresh();
				}}
				Link={Link}
				credentials={{
					confirmPassword: true,
					rememberMe: true,
					forgotPassword: true,
				}}
				organization={{
					logo: {
						upload: async (fileToUpload) => {
							// Your upload logic
							console.log("upload", fileToUpload);
							return "";
						},
						size: 256,
						extension: "png",
					},
					customRoles: [],
				}}
				localization={localization}
				multiSession
				magicLink
			>
				{children}
				<Toaster />
			</AuthUIProvider>
		</ThemeProvider>
	);
}
