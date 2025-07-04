/**
 * Server-Side RBAC Utilities
 *
 * These utilities are for server-side components and API routes only.
 * They use Better Auth's standard organization plugin with Next.js server features.
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { ApiResponse, MemberData, Permission, ValidRole } from "../types";
import {
	BusinessOperations,
	extractRoleFromMemberData,
	handlePermissionResponse,
	handleRBACError,
	RoleChecks,
	validateUserRole,
} from "./shared";

/**
 * Server-side permission checking utilities
 */

/**
 * Check if the current user has specific permissions
 * Uses Better Auth's standard organization plugin
 */
export async function hasPermission(permissions: Permission): Promise<boolean> {
	try {
		const result = await auth.api.hasPermission({
			headers: await headers(),
			body: { permissions },
		});

		return handlePermissionResponse(result);
	} catch (error) {
		return handleRBACError(error, "server permission check");
	}
}

/**
 * Map our business roles to Better Auth's standard roles
 */
export function mapToStandardRole(
	role: ValidRole,
): "member" | "admin" | "owner" {
	switch (role) {
		case "owner":
			return "owner";
		case "admin":
		case "projectManager": // Project managers get admin-level permissions
			return "admin";
		// case "member":
		// case "finance": // Finance users get member-level permissions with specific org permissions
		default:
			return "member";
	}
}

/**
 * Business permission checking functions
 * These provide clear, business-focused permission checks
 */

/**
 * Check if user can manage team members (hire, fire, change roles)
 */
export async function canManageTeam(): Promise<boolean> {
	return hasPermission({
		member: ["create", "update", "delete"],
		invitation: ["create", "cancel"],
	});
}

/**
 * Check if user can manage organization settings (billing, config)
 */
export async function canManageOrganization(): Promise<boolean> {
	return hasPermission({
		organization: ["update"],
		member: ["create", "update"],
	});
}

/**
 * Check if user can invite new members
 */
export async function canInviteMembers(): Promise<boolean> {
	return hasPermission({
		invitation: ["create"],
	});
}

/**
 * Check if user can manage billing and payments
 */
export async function canManageBilling(): Promise<boolean> {
	return hasPermission({
		organization: ["update"], // Update billing settings
		member: ["create", "update"], // Manage billing contacts
	});
}

/**
 * Check if user has full organization control (including deletion)
 */
export async function canFullyControlOrg(): Promise<boolean> {
	return hasPermission({
		organization: ["update", "delete"],
		member: ["create", "update", "delete"],
		invitation: ["create", "cancel"],
	});
}

/**
 * Standard session and authentication utilities
 */

/**
 * Get current session or redirect to sign-in
 */
export async function requireAuth(locale: string = "en") {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect(`/${locale}/auth/sign-in`);
	}

	return session;
}

/**
 * Require specific permissions or redirect
 */
export async function requirePermissions(
	permissions: Permission,
	locale: string = "en",
	fallbackUrl?: string,
) {
	const session = await requireAuth(locale);
	const hasPermissionCheck = await hasPermission(permissions);

	if (!hasPermissionCheck) {
		redirect(fallbackUrl || `/${locale}/dashboard`);
	}

	return session;
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: ValidRole): Promise<boolean> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) return false;

		// Check if user has the role in their current organization
		const memberResult = await auth.api.getActiveMember({
			headers: await headers(),
		});

		const extractedRole = extractRoleFromMemberData(
			memberResult as ApiResponse<MemberData>,
		);

		return validateUserRole(extractedRole, role);
	} catch (error) {
		return handleRBACError(error, "server role check");
	}
}

/**
 * Require specific role or redirect
 */
export async function requireRole(
	role: ValidRole,
	locale: string = "en",
	fallbackUrl?: string,
) {
	const session = await requireAuth(locale);
	const hasRoleCheck = await hasRole(role);

	if (!hasRoleCheck) {
		redirect(fallbackUrl || `/${locale}/dashboard`);
	}

	return session;
}

/**
 * Batch check multiple roles for efficiency
 */
export async function hasAnyRole(roles: ValidRole[]): Promise<boolean> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) return false;

		const memberResult = await auth.api.getActiveMember({
			headers: await headers(),
		});

		const extractedRole = extractRoleFromMemberData(
			memberResult as ApiResponse<MemberData>,
		);

		return roles.some((role) => validateUserRole(extractedRole, role));
	} catch (error) {
		return handleRBACError(error, "server multiple role check");
	}
}

/**
 * Get current user role
 */
export async function getCurrentRole(): Promise<string | null> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) return null;

		const memberResult = await auth.api.getActiveMember({
			headers: await headers(),
		});

		return extractRoleFromMemberData(memberResult as ApiResponse<MemberData>);
	} catch (error) {
		handleRBACError(error, "get current role");
		return null;
	}
}

/**
 * Role-based business operation checks
 * These are synchronous and work with role strings directly
 */

/**
 * Check if a role can perform business operations (synchronous)
 */
export function checkBusinessCapability(
	role: string,
	operation: keyof typeof BusinessOperations,
): boolean {
	return BusinessOperations[operation](role);
}

/**
 * Quick role-based checks (synchronous)
 */
export function isOwner(role: string): boolean {
	return RoleChecks.isOwner(role);
}

export function isAdmin(role: string): boolean {
	return RoleChecks.isAdmin(role);
}

export function isProjectManager(role: string): boolean {
	return RoleChecks.isProjectManager(role);
}

export function isFinance(role: string): boolean {
	return RoleChecks.isFinance(role);
}

export function isMember(role: string): boolean {
	return RoleChecks.isMember(role);
}

/**
 * Business-focused requirement methods
 */

/**
 * Require team management permissions
 */
export async function requireTeamManagement(
	locale: string = "en",
	fallbackUrl?: string,
) {
	const session = await requireAuth(locale);
	const canManage = await canManageTeam();

	if (!canManage) {
		redirect(fallbackUrl || `/${locale}/dashboard`);
	}

	return session;
}

/**
 * Require organization management permissions
 */
export async function requireOrganizationManagement(
	locale: string = "en",
	fallbackUrl?: string,
) {
	const session = await requireAuth(locale);
	const canManage = await canManageOrganization();

	if (!canManage) {
		redirect(fallbackUrl || `/${locale}/dashboard`);
	}

	return session;
}

/**
 * Require billing management permissions
 */
export async function requireBillingManagement(
	locale: string = "en",
	fallbackUrl?: string,
) {
	const session = await requireAuth(locale);
	const canManage = await canManageBilling();

	if (!canManage) {
		redirect(fallbackUrl || `/${locale}/dashboard`);
	}

	return session;
}

/**
 * Require any of the specified permissions
 */
export async function requireAnyPermission(
	permissionsList: Permission[],
	locale: string = "en",
	fallbackUrl?: string,
) {
	const session = await requireAuth(locale);

	// Check if user has any of the required permissions
	const hasAnyPermission = await Promise.all(
		permissionsList.map((permissions) => hasPermission(permissions)),
	).then((results) => results.some(Boolean));

	if (!hasAnyPermission) {
		redirect(fallbackUrl || `/${locale}/dashboard`);
	}

	return session;
}
