import { createAccessControl } from "better-auth/plugins/access";
import {
	adminAc,
	defaultStatements,
	memberAc,
	ownerAc,
} from "better-auth/plugins/organization/access";

/**
 * Permission Statements
 *
 * Using Better Auth's default organization permissions:
 * - organization: ["update", "delete"]
 * - member: ["create", "update", "delete"]
 * - invitation: ["create", "cancel"]
 */
export const statement = {
	...defaultStatements,
} as const;

// Create the access controller
export const ac = createAccessControl(statement);

/**
 * Business Role Mappings
 *
 * Map business concepts to Better Auth's built-in permissions.
 * This keeps things simple while being clear about business intent.
 */

// Basic member role - can join and participate
export const member = ac.newRole({
	// Members can view but not manage organization
	// No additional permissions beyond basic access
	...memberAc.statements,
});

// Admin role - can manage organization and all members
export const admin = ac.newRole({
	...adminAc.statements, // Include base admin permissions
	organization: ["update"], // Can update org settings (but not delete)
	member: ["create", "update", "delete"], // Can manage all members
	invitation: ["create", "cancel"], // Can manage all invitations
});

// Owner role - full permissions including organization deletion
export const owner = ac.newRole({
	...ownerAc.statements, // Include base owner permissions
	organization: ["update", "delete"], // Full organization control
	member: ["create", "update", "delete"], // Can manage all members
	invitation: ["create", "cancel"], // Can manage all invitations
});

/**
 * Business Permission Maps
 *
 * Clear, reusable permission sets for common business operations.
 */
export const BusinessPermissions = {
	// Can manage team members (hiring, roles, etc.)
	TEAM_MANAGEMENT: {
		member: ["create", "update", "delete"],
		invitation: ["create", "cancel"],
	},

	// Can manage organization settings (billing, config, etc.)
	ORG_MANAGEMENT: {
		organization: ["update"],
		member: ["create", "update"],
	},

	// Can fully control organization (including deletion)
	FULL_ORG_CONTROL: {
		organization: ["update", "delete"],
		member: ["create", "update", "delete"],
		invitation: ["create", "cancel"],
	},

	// Can invite new team members
	INVITE_MEMBERS: {
		invitation: ["create"],
	},

	// Can manage billing and finance-related settings
	BILLING_MANAGEMENT: {
		organization: ["update"], // Update billing settings
		member: ["create", "update"], // Manage billing contacts
	},
} as const;

/**
 * Export all roles for use in Better Auth configuration
 */
export const roles = {
	member,
	admin,
	owner,
};
