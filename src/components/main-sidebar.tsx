"use client";

import { Home, LogOut, Shield, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { Link } from "@/modules/i18n/navigation";

/**
 * MainSidebar Component
 *
 * The main navigation sidebar for the private/authenticated sections.
 * Features:
 * - Header with app branding
 * - Content section with navigation items (Dashboard)
 * - Footer with user info and sign out functionality
 * - Uses shadcn Sidebar components
 * - Internationalization support
 * - Better Auth integration for sign out
 */
const MainSidebar = () => {
	const t = useTranslations("Navigation");
	const authT = useTranslations("Auth");
	const router = useRouter();
	const { data: session } = authClient.useSession();

	// Navigation items for the sidebar content
	const items = [
		{
			title: t("dashboard"),
			url: "/dashboard",
			icon: Home,
		},
		{
			title: "RBAC Demo",
			url: "/rbac-demo",
			icon: Shield,
		},
	];

	/**
	 * Handle user sign out
	 * Uses Better Auth client to sign out the user
	 */
	const handleSignOut = async () => {
		try {
			await authClient.signOut({
				// Redirect to sign-in page after sign out
				fetchOptions: {
					onSuccess: () => {
						toast.success(authT("signOut"));
						router.push("/auth/sign-in");
					},
				},
			});
		} catch (error) {
			console.error("Sign out error:", error);
			toast.error("Failed to sign out");
		}
	};

	return (
		<Sidebar>
			{/* Header Section */}
			<SidebarHeader className="border-b border-border">
				<div className="flex items-center space-x-2 px-2 py-2">
					<div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
						<span className="text-primary-foreground font-bold text-sm">
							DP
						</span>
					</div>
					<div className="flex flex-col">
						<span className="font-semibold text-sm">Deck Pilot</span>
						<span className="text-xs text-muted-foreground">
							Project Management
						</span>
					</div>
				</div>
			</SidebarHeader>

			{/* Content Section */}
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<Link href={item.url}>
											<item.icon className="h-4 w-4" />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			{/* Footer Section */}
			<SidebarFooter className="border-t border-border">
				<SidebarMenu>
					<SidebarMenuItem>
						<div className="flex items-center justify-between p-2">
							<div className="flex items-center space-x-2 min-w-0 flex-1">
								<div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
									<User className="h-3 w-3" />
								</div>
								<div className="flex flex-col min-w-0 flex-1">
									<span className="text-sm font-medium truncate">
										{session?.user?.name || "User"}
									</span>
									<span className="text-xs text-muted-foreground truncate">
										{session?.user?.email || "Welcome back"}
									</span>
								</div>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleSignOut}
								className="h-8 w-8 p-0 shrink-0"
								title={authT("signOut")}
							>
								<LogOut className="h-4 w-4" />
								<span className="sr-only">{authT("signOut")}</span>
							</Button>
						</div>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
};

export { MainSidebar };
