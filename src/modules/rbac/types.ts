import type {
	BusinessPermissions,
	statement,
} from "@/modules/rbac/permissions";

/**
 * Business Permission Sets
 *
 * Reusable permission sets for common business operations.
 * These map to Better Auth's standard organization permissions.
 */
export type { BusinessPermissions };

// Type definitions for better TypeScript support
export type Resource = keyof typeof statement;
export type Action<T extends Resource> = (typeof statement)[T][number];
export type Permission = {
	[K in Resource]?: Action<K>[];
};

// Valid role types
export type ValidRole =
	| "member"
	| "admin"
	| "owner"
	| "projectManager"
	| "finance";

// API response structure for member data
export interface MemberData {
	role: string;
	[key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
	data?: T;
	success?: boolean;
	[key: string]: unknown;
}
