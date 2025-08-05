"use client";

import { Building, Home, LogOut, Shield, User, Users } from "lucide-react";
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
import { Link, usePathname } from "@/modules/i18n/navigation";
import { Logo } from "./logo";

/**
 * MainSidebar Component
 *
 * The main navigation sidebar for the private/authenticated sections.
 * Features:
 * - Header with app branding
 * - Content section with navigation items (Dashboard, Account, Organization)
 * - Active state highlighting based on current URL
 * - Footer with user info and sign out functionality
 * - Uses shadcn Sidebar components
 * - Internationalization support
 * - Better Auth integration for sign out
 */
const MainSidebar = () => {
	const t = useTranslations("navigation");
	const router = useRouter();
	const pathname = usePathname();
	const { data: session } = authClient.useSession();

	/**
	 * Check if a menu item should be marked as active
	 * @param url - The menu item URL to check against current pathname
	 * @returns boolean indicating if the item is active
	 */
	const isActiveItem = (url: string): boolean => {
		// For exact matches like "/dashboard"
		if (pathname === url) {
			return true;
		}

		return false;
	};

	// Navigation items for the sidebar content
	const items = [
		{
			title: t("dashboard"),
			url: "/dashboard",
			icon: Home,
		},
	];

	const organizationItems = [
		{
			title: t("settings"),
			url: "/account/organization",
			icon: Building,
		},
		{
			title: t("members"),
			url: "/account/organization/members",
			icon: Users,
		},
	];

	const accountItems = [
		{
			title: t("settings"),
			url: "/account",
			icon: User,
		},
		{
			title: t("security"),
			url: "/account/security",
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
						toast.success(t("logout"));
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
		<Sidebar className="border-none">
			{/* Header Section */}
			<SidebarHeader>
				<div className="flex items-center justify-between px-2 py-2">
					<Logo />
					<span className="text-xs text-muted-foreground">v1.0</span>
				</div>
			</SidebarHeader>

			{/* Content Section */}
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className="uppercase">
						{t("general")}
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild isActive={isActiveItem(item.url)}>
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
				<SidebarGroup>
					<SidebarGroupLabel className="uppercase">
						{t("account")}
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{accountItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild isActive={isActiveItem(item.url)}>
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
				<SidebarGroup>
					<SidebarGroupLabel className="uppercase">
						{t("organization")}
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{organizationItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild isActive={isActiveItem(item.url)}>
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
			<SidebarFooter>
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
								title={t("logout")}
							>
								<LogOut className="h-4 w-4" />
								<span className="sr-only">{t("logout")}</span>
							</Button>
						</div>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
};

export { MainSidebar };
