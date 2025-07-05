"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { RoleChecks } from "@/modules/rbac/lib/shared";
import {
	hasPermission as hasPermissionClient,
	hasRole as hasRoleClient,
} from "../lib/client";
import type { Permission, ValidRole } from "../types";

/**
 * React Hooks for Permission Checking
 *
 * These hooks provide reactive permission checking in React components.
 */

/**
 * Hook to check if current user has specific permissions
 */
export function usePermissions(permissions: Permission) {
	const [hasPermission, setHasPermission] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const { data: session } = authClient.useSession();

	useEffect(() => {
		const checkPermissions = async () => {
			if (!session?.user) {
				setHasPermission(false);
				setIsLoading(false);
				return;
			}

			try {
				const result = await hasPermissionClient(permissions);
				setHasPermission(result);
			} catch (error) {
				console.error("Permission check error:", error);
				setHasPermission(false);
			} finally {
				setIsLoading(false);
			}
		};

		checkPermissions();
	}, [session?.user, permissions]);

	return { hasPermission, isLoading };
}

/**
 * Hook to check if current user has a specific role
 */
export function useRole(role: ValidRole) {
	const [hasRole, setHasRole] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const { data: session } = authClient.useSession();

	useEffect(() => {
		const checkRole = async () => {
			if (!session?.user) {
				setHasRole(false);
				setIsLoading(false);
				return;
			}

			try {
				const result = await hasRoleClient(role);
				setHasRole(result);
			} catch (error) {
				console.error("Role check error:", error);
				setHasRole(false);
			} finally {
				setIsLoading(false);
			}
		};

		checkRole();
	}, [session?.user, role]);

	return { hasRole, isLoading };
}

/**
 * Hook to get current user's role
 */
export function useCurrentRole() {
	const [role, setRole] = useState<ValidRole | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const { data: session } = authClient.useSession();

	useEffect(() => {
		const getCurrentRole = async () => {
			if (!session?.user) {
				setRole(null);
				setIsLoading(false);
				return;
			}

			try {
				// TODO: This would need to be implemented in ClientPermissions
				// For now, we'll use a simple approach
				// const sessionData = await ClientPermissions.getSession();

				// Extract role from session or member data
				// This implementation depends on how Better Auth stores role information
				setRole("member"); // Fallback - this should be properly implemented
			} catch (error) {
				console.error("Current role check error:", error);
				setRole(null);
			} finally {
				setIsLoading(false);
			}
		};

		getCurrentRole();
	}, [session?.user]);

	return { role, isLoading };
}

/**
 * Combined authentication and role checking hook
 */
export function useAuth() {
	const { data: session, isPending } = authClient.useSession();
	const { role, isLoading: roleLoading } = useCurrentRole();

	const isAuthenticated = Boolean(session?.user);
	const isLoading = isPending || roleLoading;

	return {
		session,
		user: session?.user || null,
		role,
		isAuthenticated,
		isLoading,
		// Convenience role checks
		isOwner: role ? RoleChecks.isOwner(role) : false,
		isAdmin: role ? RoleChecks.isAdmin(role) : false,
		isProjectManager: role ? RoleChecks.isProjectManager(role) : false,
		isFinance: role ? RoleChecks.isFinance(role) : false,
		isMember: role ? RoleChecks.isMember(role) : false,
	};
}
