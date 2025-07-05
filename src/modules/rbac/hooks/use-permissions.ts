"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { RoleChecks } from "@/modules/rbac/lib/shared";
import {
	getCurrentRole as getCurrentRoleClient,
	hasPermission as hasPermissionClient,
	hasRole as hasRoleClient,
} from "../lib/client";
import type { Permission, ValidRole } from "../types";

/**
 * React Hooks for Permission Checking
 *
 * These hooks provide reactive permission checking in React components.
 * They use Better Auth's organization plugin with proper client-side functions.
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
				// Use the proper client function that implements Better Auth's organization.hasPermission
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
				// Use the proper client function that gets role from Better Auth's organization
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
				// Use the proper client function that extracts role from Better Auth's organization member data
				const currentRole = await getCurrentRoleClient();
				setRole(currentRole as ValidRole);
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
		// Convenience role checks - these will work correctly now that role is properly fetched
		isOwner: role ? RoleChecks.isOwner(role) : false,
		isAdmin: role ? RoleChecks.isAdmin(role) : false,
		isProjectManager: role ? RoleChecks.isProjectManager(role) : false,
		isFinance: role ? RoleChecks.isFinance(role) : false,
		isMember: role ? RoleChecks.isMember(role) : false,
	};
}
