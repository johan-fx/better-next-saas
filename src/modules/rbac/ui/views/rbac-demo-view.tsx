"use client";

import {
	CreditCard,
	Crown,
	Lock,
	Settings,
	Shield,
	Star,
	Unlock,
	UserPlus,
	Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/modules/rbac/hooks/use-permissions";
import {
	FinanceAccess,
	MinimumRoleGuard,
	OwnerOnly,
	PermissionGuard,
	ProjectManagerAccess,
} from "@/modules/rbac/ui/components/permission-guard";
import { BusinessPermissions } from "../../permissions";

/**
 * RBAC Demo View Component
 *
 * This component demonstrates the simplified role-based access control system
 * using Better Auth's built-in organization permissions with business mappings.
 */
export function RBACDemoView() {
	const {
		user,
		role,
		isLoading,
		isOwner,
		isAdmin,
		isProjectManager,
		isFinance,
	} = useAuth();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<Shield className="h-8 w-8 animate-spin mx-auto mb-4" />
					<p>Loading RBAC demo...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold flex items-center justify-center gap-2">
					<Shield className="h-8 w-8" />
					RBAC System Demo
				</h1>
				<p className="text-muted-foreground mt-2">
					Simplified role-based access control using Better Auth's built-in
					organization permissions
				</p>
			</div>

			{/* Current User Info */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Current User Information
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<span className="text-sm font-medium">User Email:</span>
							<p className="text-lg">{user?.email || "Not authenticated"}</p>
						</div>
						<div>
							<span className="text-sm font-medium">Current Role:</span>
							<div className="flex items-center gap-2 mt-1">
								<Badge variant={role ? "default" : "secondary"}>
									{role || "No role assigned"}
								</Badge>
								{isOwner && <Crown className="h-4 w-4 text-yellow-500" />}
								{isAdmin && <Star className="h-4 w-4 text-blue-500" />}
							</div>
						</div>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
						<Badge variant={isOwner ? "default" : "outline"}>
							Owner: {isOwner ? "✓" : "✗"}
						</Badge>
						<Badge variant={isAdmin ? "default" : "outline"}>
							Admin: {isAdmin ? "✓" : "✗"}
						</Badge>
						<Badge variant={isProjectManager ? "default" : "outline"}>
							PM: {isProjectManager ? "✓" : "✗"}
						</Badge>
						<Badge variant={isFinance ? "default" : "outline"}>
							Finance: {isFinance ? "✓" : "✗"}
						</Badge>
						<Badge variant="outline">Member: ✓</Badge>
					</div>
				</CardContent>
			</Card>

			{/* Better Auth Organization Permissions Demo */}
			<Card className="border-blue-200">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-blue-700">
						<Shield className="h-5 w-5" />
						Better Auth Organization Permissions
					</CardTitle>
					<CardDescription>
						Using Better Auth's standard organization, member, and invitation
						permissions
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
						<div className="p-3 bg-blue-50 rounded-lg">
							<h4 className="font-semibold text-blue-900 mb-2">Organization</h4>
							<p className="text-blue-700">["update", "delete"]</p>
							<p className="text-xs text-blue-600 mt-1">
								Manage org settings and deletion
							</p>
						</div>
						<div className="p-3 bg-green-50 rounded-lg">
							<h4 className="font-semibold text-green-900 mb-2">Member</h4>
							<p className="text-green-700">["create", "update", "delete"]</p>
							<p className="text-xs text-green-600 mt-1">
								Manage team members and roles
							</p>
						</div>
						<div className="p-3 bg-purple-50 rounded-lg">
							<h4 className="font-semibold text-purple-900 mb-2">Invitation</h4>
							<p className="text-purple-700">["create", "cancel"]</p>
							<p className="text-xs text-purple-600 mt-1">
								Send and manage invitations
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Role-Based UI Components */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{/* Owner Only */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Crown className="h-5 w-5 text-yellow-500" />
							Owner Only Content
						</CardTitle>
						<CardDescription>
							Full organization control including deletion
						</CardDescription>
					</CardHeader>
					<CardContent>
						<OwnerOnly
							fallback={
								<div className="flex items-center gap-2 text-muted-foreground">
									<Lock className="h-4 w-4" />
									<span>Access denied - Owner role required</span>
								</div>
							}
						>
							<div className="space-y-3">
								<div className="flex items-center gap-2 text-green-600">
									<Unlock className="h-4 w-4" />
									<span>Owner access granted!</span>
								</div>
								<Button size="sm" className="w-full">
									<Settings className="h-4 w-4 mr-2" />
									Organization Settings
								</Button>
								<Button size="sm" variant="destructive" className="w-full">
									Delete Organization
								</Button>
							</div>
						</OwnerOnly>
					</CardContent>
				</Card>

				{/* Admin Access */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Star className="h-5 w-5 text-blue-500" />
							Admin Access
						</CardTitle>
						<CardDescription>
							Organization management (no deletion)
						</CardDescription>
					</CardHeader>
					<CardContent>
						<MinimumRoleGuard
							minimumRole="admin"
							fallback={
								<div className="flex items-center gap-2 text-muted-foreground">
									<Lock className="h-4 w-4" />
									<span>Access denied - Admin role required</span>
								</div>
							}
						>
							<div className="space-y-3">
								<div className="flex items-center gap-2 text-green-600">
									<Unlock className="h-4 w-4" />
									<span>Admin access granted!</span>
								</div>
								<Button size="sm" className="w-full">
									<Users className="h-4 w-4 mr-2" />
									Manage Members
								</Button>
								<Button size="sm" variant="outline" className="w-full">
									Update Organization
								</Button>
							</div>
						</MinimumRoleGuard>
					</CardContent>
				</Card>

				{/* Project Manager Access */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5 text-purple-500" />
							Team Management
						</CardTitle>
						<CardDescription>
							Project managers can manage team members
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ProjectManagerAccess
							fallback={
								<div className="flex items-center gap-2 text-muted-foreground">
									<Lock className="h-4 w-4" />
									<span>Access denied - Project Manager role required</span>
								</div>
							}
						>
							<div className="space-y-3">
								<div className="flex items-center gap-2 text-green-600">
									<Unlock className="h-4 w-4" />
									<span>Project Manager access granted!</span>
								</div>
								<Button size="sm" className="w-full">
									<Users className="h-4 w-4 mr-2" />
									Manage Team
								</Button>
								<Button size="sm" variant="outline" className="w-full">
									<UserPlus className="h-4 w-4 mr-2" />
									Invite Members
								</Button>
							</div>
						</ProjectManagerAccess>
					</CardContent>
				</Card>

				{/* Finance Access */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CreditCard className="h-5 w-5 text-green-500" />
							Finance Dashboard
						</CardTitle>
						<CardDescription>Billing and organization updates</CardDescription>
					</CardHeader>
					<CardContent>
						<FinanceAccess
							fallback={
								<div className="flex items-center gap-2 text-muted-foreground">
									<Lock className="h-4 w-4" />
									<span>Access denied - Finance role required</span>
								</div>
							}
						>
							<div className="space-y-3">
								<div className="flex items-center gap-2 text-green-600">
									<Unlock className="h-4 w-4" />
									<span>Finance access granted!</span>
								</div>
								<Button size="sm" className="w-full">
									<CreditCard className="h-4 w-4 mr-2" />
									Billing Settings
								</Button>
								<Button size="sm" variant="outline" className="w-full">
									<Settings className="h-4 w-4 mr-2" />
									Update Organization
								</Button>
							</div>
						</FinanceAccess>
					</CardContent>
				</Card>

				{/* Team Management Permissions */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5 text-indigo-500" />
							Team Management Permissions
						</CardTitle>
						<CardDescription>
							Based on member and invitation permissions
						</CardDescription>
					</CardHeader>
					<CardContent>
						<PermissionGuard
							permissions={BusinessPermissions.TEAM_MANAGEMENT}
							fallback={
								<div className="flex items-center gap-2 text-muted-foreground">
									<Lock className="h-4 w-4" />
									<span>Missing team management permissions</span>
								</div>
							}
						>
							<div className="space-y-3">
								<div className="flex items-center gap-2 text-green-600">
									<Unlock className="h-4 w-4" />
									<span>Team management access granted!</span>
								</div>
								<Button size="sm" className="w-full">
									<Users className="h-4 w-4 mr-2" />
									Full Team Management
								</Button>
							</div>
						</PermissionGuard>
					</CardContent>
				</Card>

				{/* Invitation Permissions */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<UserPlus className="h-5 w-5 text-orange-500" />
							Invitation Permissions
						</CardTitle>
						<CardDescription>Can invite new team members</CardDescription>
					</CardHeader>
					<CardContent>
						<PermissionGuard
							permissions={BusinessPermissions.INVITE_MEMBERS}
							fallback={
								<div className="flex items-center gap-2 text-muted-foreground">
									<Lock className="h-4 w-4" />
									<span>Missing invitation permissions</span>
								</div>
							}
						>
							<div className="space-y-3">
								<div className="flex items-center gap-2 text-green-600">
									<Unlock className="h-4 w-4" />
									<span>Invitation access granted!</span>
								</div>
								<Button size="sm" className="w-full">
									<UserPlus className="h-4 w-4 mr-2" />
									Send Invitations
								</Button>
							</div>
						</PermissionGuard>
					</CardContent>
				</Card>
			</div>

			{/* Implementation Info */}
			<Card>
				<CardHeader>
					<CardTitle>Simplified Better Auth Implementation</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h4 className="font-semibold mb-2">Business Permission Sets:</h4>
							<ul className="text-sm space-y-1 text-muted-foreground">
								<li>
									• <code>TEAM_MANAGEMENT</code> - Manage members and
									invitations
								</li>
								<li>
									• <code>ORG_MANAGEMENT</code> - Update organization settings
								</li>
								<li>
									• <code>BILLING_MANAGEMENT</code> - Manage billing and
									payments
								</li>
								<li>
									• <code>INVITE_MEMBERS</code> - Send invitations only
								</li>
								<li>
									• <code>FULL_ORG_CONTROL</code> - Complete organization
									control
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold mb-2">Better Auth Permissions:</h4>
							<ul className="text-sm space-y-1 text-muted-foreground">
								<li>
									• <code>organization</code> - ["update", "delete"]
								</li>
								<li>
									• <code>member</code> - ["create", "update", "delete"]
								</li>
								<li>
									• <code>invitation</code> - ["create", "cancel"]
								</li>
								<li className="text-green-600 font-medium">
									✓ No custom resources needed
								</li>
								<li className="text-green-600 font-medium">
									✓ Standard Better Auth integration
								</li>
							</ul>
						</div>
					</div>

					<div className="border-t pt-4">
						<h4 className="font-semibold mb-2">Role Mappings:</h4>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
							<Badge variant="outline" className="justify-center">
								Owner → owner
							</Badge>
							<Badge variant="outline" className="justify-center">
								Admin → admin
							</Badge>
							<Badge variant="outline" className="justify-center">
								Project Manager → admin
							</Badge>
							<Badge variant="outline" className="justify-center">
								Finance → member
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
