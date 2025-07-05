import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { MainSidebar } from "@/components/main-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/lib/auth";

type Props = {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
};

/**
 * Private Layout Component
 *
 * This layout wraps all private/authenticated sections of the app.
 * It provides:
 * - Authentication protection - redirects to sign-in if not authenticated
 * - Sidebar navigation using shadcn Sidebar components
 * - Consistent layout structure for all private pages
 * - Internationalization support
 */
export default async function PrivateLayout({ children, params }: Props) {
	const { locale } = await params;

	// Enable static rendering for this locale
	setRequestLocale(locale);

	// Check authentication status using Better Auth
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	// Redirect to sign-in if user is not authenticated
	if (!session?.user) {
		redirect(`/${locale}/auth/sign-in`);
	}

	return (
		<SidebarProvider>
			<MainSidebar />
			<main className="flex flex-col h-screen w-screen bg-muted">
				{children}
			</main>
			<Toaster />
		</SidebarProvider>
	);
}
