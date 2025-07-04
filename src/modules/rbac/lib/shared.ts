/**
 * Shared RBAC Utilities
 *
 * These utilities can be used by both client and server components.
 * They don't import any server-only or client-only features.
 */

import { ApiResponse, MemberData, ValidRole } from "../types";

/**
 * Role hierarchy for quick checks
 */
export const RoleHierarchy = {
	owner: 100,
	admin: 80,
	projectManager: 60,
	finance: 40,
	member: 20,
} as const;

/**
 * Check if a role has higher or equal level than another role
 */
export function hasRoleLevel(
	userRole: string,
	requiredRole: keyof typeof RoleHierarchy,
): boolean {
	const userLevel = RoleHierarchy[userRole as keyof typeof RoleHierarchy] || 0;
	const requiredLevel = RoleHierarchy[requiredRole];
	return userLevel >= requiredLevel;
}

/**
 * Common role checking shortcuts
 */
export const RoleChecks = {
	isOwner: (role: string) => hasRoleLevel(role, "owner"),
	isAdmin: (role: string) => hasRoleLevel(role, "admin"),
	isProjectManager: (role: string) => hasRoleLevel(role, "projectManager"),
	isFinance: (role: string) => hasRoleLevel(role, "finance"),
	isMember: (role: string) => hasRoleLevel(role, "member"),
	canManageUsers: (role: string) => hasRoleLevel(role, "projectManager"), // Project managers can manage team
	canManageOrganization: (role: string) => hasRoleLevel(role, "admin"),
	canAccessBilling: (role: string) => hasRoleLevel(role, "finance"),
};

/**
 * Business operation permission helpers
 */
export const BusinessOperations = {
	canManageTeam: (role: string) => RoleChecks.canManageUsers(role),
	canInviteMembers: (role: string) => hasRoleLevel(role, "projectManager"),
	canManageBilling: (role: string) =>
		RoleChecks.canAccessBilling(role) || RoleChecks.isAdmin(role),
	canDeleteOrganization: (role: string) => RoleChecks.isOwner(role),
	canUpdateOrganization: (role: string) => hasRoleLevel(role, "finance"), // Finance and above can update org
};

/**
 * Shared error handling utility for RBAC operations
 */
export class RBACError extends Error {
	constructor(
		message: string,
		public operation: string,
		public originalError?: unknown,
	) {
		super(message);
		this.name = "RBACError";
	}
}

/**
 * Common error handler for RBAC operations
 */
export function handleRBACError(
	error: unknown,
	operation: string,
	fallbackValue: boolean = false,
): boolean {
	console.error(`RBAC ${operation} failed:`, error);
	return fallbackValue;
}

/**
 * Parse and validate member role from API response
 * This logic is shared between client and server implementations
 */
export function extractRoleFromMemberData(
	memberResult: ApiResponse<MemberData> | null | undefined,
): string | null {
	if (
		memberResult &&
		"data" in memberResult &&
		memberResult.data &&
		typeof memberResult.data === "object" &&
		"role" in memberResult.data
	) {
		return String(memberResult.data.role);
	}
	return null;
}

/**
 * Check if a user has a specific role based on extracted role data
 */
export function validateUserRole(
	extractedRole: string | null,
	targetRole: ValidRole,
): boolean {
	if (!extractedRole) return false;

	return extractedRole === targetRole || extractedRole.includes(targetRole);
}

/**
 * Standardized permission response handler
 */
export function handlePermissionResponse(result: ApiResponse): boolean {
	if ("success" in result) {
		return Boolean(result.success);
	}
	return Boolean(result);
}
