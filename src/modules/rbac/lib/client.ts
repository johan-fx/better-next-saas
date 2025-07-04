"use client";

/**
 * Client-Side RBAC Utilities
 *
 * These utilities are for client-side components and hooks only.
 * They use Better Auth's standard organization plugin with business mappings.
 */

import { authClient } from "@/lib/auth-client";
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
 * Client-side permission checking utilities
 */

/**
 * Check if the current user has specific permissions
 * Uses Better Auth's standard organization plugin
 */
export async function hasPermission(permissions: Permission): Promise<boolean> {
	try {
		const result = await authClient.organization.hasPermission({
			permissions,
		});
		return handlePermissionResponse(result);
	} catch (error) {
		return handleRBACError(error, "client permission check");
	}
}

/**
 * Check if a role has specific permissions (synchronous)
 * Uses Better Auth's standard organization plugin
 */
export function checkRolePermission(
	role: ValidRole,
	permissions: Permission,
): boolean {
	try {
		// Map custom roles to standard Better Auth roles
		const mappedRole = mapToStandardRole(role);

		return authClient.organization.checkRolePermission({
			role: mappedRole,
			permissions,
		});
	} catch (error) {
		return handleRBACError(error, "client role permission check");
	}
}

/**
 * Map our business roles to Better Auth's standard roles
 */
function mapToStandardRole(role: ValidRole): "member" | "admin" | "owner" {
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
 * Standard session and role utilities
 */

/**
 * Check if user has a specific role
 */
export async function hasRole(role: ValidRole): Promise<boolean> {
	try {
		const session = await authClient.getSession();
		if (!session?.data?.user) return false;

		const memberResult = await authClient.organization.getActiveMember();
		const extractedRole = extractRoleFromMemberData(
			memberResult as ApiResponse<MemberData>,
		);

		return validateUserRole(extractedRole, role);
	} catch (error) {
		return handleRBACError(error, "client role check");
	}
}

/**
 * Batch check multiple roles for efficiency
 */
export async function hasAnyRole(roles: ValidRole[]): Promise<boolean> {
	try {
		const session = await authClient.getSession();
		if (!session?.data?.user) return false;

		const memberResult = await authClient.organization.getActiveMember();
		const extractedRole = extractRoleFromMemberData(
			memberResult as ApiResponse<MemberData>,
		);

		return roles.some((role) => validateUserRole(extractedRole, role));
	} catch (error) {
		return handleRBACError(error, "client multiple role check");
	}
}

/**
 * Get current user role
 */
export async function getCurrentRole(): Promise<string | null> {
	try {
		const session = await authClient.getSession();
		if (!session?.data?.user) return null;

		const memberResult = await authClient.organization.getActiveMember();
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
