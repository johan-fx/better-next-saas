"use client";

import type React from "react";
import {
	useCurrentRole,
	usePermissions,
} from "@/modules/rbac/hooks/use-permissions";
import {
	hasRoleLevel,
	type Permission,
	type ValidRole,
} from "@/modules/rbac/lib/shared";

/**
 * Props for PermissionGuard component
 */
interface PermissionGuardProps {
	children: React.ReactNode;
	permissions?: Permission;
	roles?: ValidRole[];
	requireAll?: boolean; // Whether all permissions/roles are required (AND) or just one (OR)
	fallback?: React.ReactNode;
	loading?: React.ReactNode;
}

/**
 * PermissionGuard Component
 *
 * Conditionally renders children based on user permissions and/or roles.
 * Useful for hiding UI elements that users don't have access to.
 */
export function PermissionGuard({
	children,
	permissions,
	roles,
	requireAll = false,
	fallback = null,
	loading = null,
}: PermissionGuardProps) {
	const permissionCheck = usePermissions(permissions || {});
	const { role: currentRole, isLoading: roleLoading } = useCurrentRole();

	// Check if still loading
	const isLoading = permissionCheck.isLoading || roleLoading;

	if (isLoading) {
		return <>{loading}</>;
	}

	// Determine access based on permissions and roles
	let hasAccess = true;

	if (permissions) {
		hasAccess = permissionCheck.hasPermission;
	}

	if (roles && roles.length > 0 && currentRole) {
		// Check if current role matches any of the required roles
		const roleMatches = roles.includes(currentRole);

		if (requireAll) {
			// For requireAll with multiple roles, user must have all roles
			// This is a limitation - we can only check if user has the current role
			// For multiple role requirements, consider using specific role checks
			hasAccess = hasAccess && roleMatches;
		} else {
			// At least one role must be satisfied
			hasAccess = hasAccess && roleMatches;
		}
	} else if (roles && roles.length > 0) {
		// No current role, but roles are required
		hasAccess = false;
	}

	return hasAccess ? children : fallback;
}

/**
 * Simple role-based guard component
 */
interface RoleGuardProps {
	children: React.ReactNode;
	requiredRole: ValidRole;
	fallback?: React.ReactNode;
	loading?: React.ReactNode;
}

export function RoleGuard({
	children,
	requiredRole,
	fallback = null,
	loading = null,
}: RoleGuardProps) {
	return (
		<PermissionGuard
			roles={[requiredRole]}
			fallback={fallback}
			loading={loading}
		>
			{children}
		</PermissionGuard>
	);
}

/**
 * Minimum role level guard (hierarchical)
 */
interface MinimumRoleGuardProps {
	children: React.ReactNode;
	minimumRole: ValidRole;
	fallback?: React.ReactNode;
	loading?: React.ReactNode;
}

export function MinimumRoleGuard({
	children,
	minimumRole,
	fallback = null,
	loading = null,
}: MinimumRoleGuardProps) {
	const { role: currentRole, isLoading } = useCurrentRole();

	if (isLoading) {
		return <>{loading}</>;
	}

	// Check if user role meets minimum level using role hierarchy
	const hasAccess = currentRole
		? hasRoleLevel(currentRole, minimumRole)
		: false;

	return hasAccess ? children : fallback;
}

/**
 * Convenience components for common role checks
 */
export function AdminOnly({
	children,
	fallback = null,
}: {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}) {
	return (
		<RoleGuard requiredRole="admin" fallback={fallback}>
			{children}
		</RoleGuard>
	);
}

export function OwnerOnly({
	children,
	fallback = null,
}: {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}) {
	return (
		<RoleGuard requiredRole="owner" fallback={fallback}>
			{children}
		</RoleGuard>
	);
}

export function ProjectManagerAccess({
	children,
	fallback = null,
}: {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}) {
	return (
		<MinimumRoleGuard minimumRole="projectManager" fallback={fallback}>
			{children}
		</MinimumRoleGuard>
	);
}

export function FinanceAccess({
	children,
	fallback = null,
}: {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}) {
	return (
		<RoleGuard requiredRole="finance" fallback={fallback}>
			{children}
		</RoleGuard>
	);
}
