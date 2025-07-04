import {
	boolean,
	index,
	pgTable,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

/**
 * Database Schema for Better Auth
 *
 * This schema defines all the necessary tables for Better Auth:
 * - users: User account information
 * - sessions: Active user sessions
 * - accounts: OAuth provider accounts
 * - verifications: Email verification tokens
 * - organizations: Organization information
 * - members: Organization members with roles
 * - invitations: Organization invitations
 * - user_preferences: User preferences and settings
 *
 * Multi-tenant Tables (isolated by organizationId):
 * - audit_logs: System audit logging
 * - teams: Organization teams
 * - user_teams: User team memberships
 * - custom_permissions: Custom permission definitions
 * - resource_permissions: Resource-specific permissions
 * - organization_security_settings: Organization security config
 * - user_security_settings: User security preferences per org
 */

// Users table - stores user account information
export const users = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("emailVerified").notNull().default(false),
	image: text("image"),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	// Admin plugin fields
	role: text("role").default("user"), // User role for admin plugin (user, admin, etc.)
	banned: boolean("banned").default(false), // Whether the user is banned
	banReason: text("banReason"), // Reason for the ban
	banExpires: timestamp("banExpires"), // When the ban expires
});

// Sessions table - stores active user sessions
export const sessions = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expiresAt").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	// Organization support - active organization in session
	activeOrganizationId: text("activeOrganizationId").references(
		() => organizations.id,
		{ onDelete: "set null" },
	),
	// Admin plugin field - for session impersonation
	impersonatedBy: text("impersonatedBy").references(() => users.id, {
		onDelete: "set null",
	}), // Admin user who is impersonating this session
});

// Accounts table - stores OAuth provider accounts
export const accounts = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
	refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Verifications table - stores email verification tokens
export const verifications = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Organizations table - stores organization information
export const organizations = pgTable("organization", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	logo: text("logo"),
	metadata: text("metadata"), // JSON field for additional data
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Members table - stores organization members and their roles
export const members = pgTable(
	"member",
	{
		id: text("id").primaryKey(),
		organizationId: text("organizationId")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		userId: text("userId")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		role: text("role").notNull().default("member"), // member, admin, owner, custom roles
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(table) => ({
		// Ensure a user can only have one membership per organization
		uniqueUserOrg: unique().on(table.userId, table.organizationId),
		// Index for fast lookups by organization
		orgIndex: index().on(table.organizationId),
		// Index for fast lookups by user
		userIndex: index().on(table.userId),
	}),
);

// Invitations table - stores organization invitations
export const invitations = pgTable(
	"invitation",
	{
		id: text("id").primaryKey(),
		organizationId: text("organizationId")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		email: text("email").notNull(),
		role: text("role").notNull().default("member"),
		status: text("status").notNull().default("pending"), // pending, accepted, rejected, cancelled
		inviterId: text("inviterId")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		expiresAt: timestamp("expiresAt").notNull(),
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(table) => ({
		// Index for fast lookups by organization
		orgIndex: index().on(table.organizationId),
		// Index for fast lookups by email
		emailIndex: index().on(table.email),
	}),
);

// User Preferences table - stores user preferences per organization (MULTI-TENANT)
export const userPreferences = pgTable(
	"user_preferences",
	{
		id: text("id").primaryKey(),
		userId: text("userId")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		// Multi-tenant: Each user can have different preferences per organization
		organizationId: text("organizationId")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		language: text("language").notNull().default("en"), // User's preferred language
		theme: text("theme").default("system"), // Theme preference: light, dark, system
		timezone: text("timezone").default("UTC"), // User's timezone preference
		emailNotifications: boolean("emailNotifications").notNull().default(true), // Email notification preference
		// JSON field for additional preferences that might be added in the future
		additionalPreferences: text("additionalPreferences"), // Store as JSON string
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(table) => ({
		// Ensure a user can only have one preference set per organization
		uniqueUserOrg: unique().on(table.userId, table.organizationId),
		// Index for fast lookups by organization
		orgIndex: index().on(table.organizationId),
	}),
);

// ======================
// NEW MULTI-TENANT TABLES
// ======================

// Audit Logs table - stores system audit events per organization
export const auditLogs = pgTable(
	"audit_logs",
	{
		id: text("id").primaryKey(),
		organizationId: text("organizationId")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		userId: text("userId").references(() => users.id, { onDelete: "set null" }), // Can be null for system events
		action: text("action").notNull(), // create, update, delete, login, etc.
		resource: text("resource").notNull(), // user, organization, permission, etc.
		resourceId: text("resourceId"), // ID of the affected resource
		metadata: text("metadata"), // JSON field for additional event data
		ipAddress: text("ipAddress"),
		userAgent: text("userAgent"),
		createdAt: timestamp("createdAt").notNull().defaultNow(),
	},
	(table) => [
		// Index for fast lookups by organization and date (most common query)
		index().on(table.organizationId, table.createdAt),
		// Index for fast lookups by user
		index().on(table.userId),
		// Index for fast lookups by action and resource
		index().on(table.action, table.resource),
	],
);

// Teams table - stores organizational teams
export const teams = pgTable(
	"teams",
	{
		id: text("id").primaryKey(),
		organizationId: text("organizationId")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		description: text("description"),
		slug: text("slug").notNull(), // URL-friendly team identifier
		metadata: text("metadata"), // JSON field for additional team data
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(table) => [
		// Ensure team slugs are unique within an organization
		unique().on(table.organizationId, table.slug),
		// Index for fast lookups by organization
		index().on(table.organizationId),
	],
);

// User Teams table - stores user team memberships
export const userTeams = pgTable(
	"user_teams",
	{
		id: text("id").primaryKey(),
		organizationId: text("organizationId")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		userId: text("userId")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		teamId: text("teamId")
			.notNull()
			.references(() => teams.id, { onDelete: "cascade" }),
		role: text("role").notNull().default("member"), // member, lead, admin
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(table) => [
		// Ensure a user can only have one membership per team
		unique().on(table.userId, table.teamId),
		// Index for fast lookups by team
		index().on(table.teamId),
		// Index for fast lookups by user and organization
		index().on(table.userId, table.organizationId),
	],
);

// Custom Permissions table - stores custom permission definitions per organization
export const customPermissions = pgTable(
	"custom_permissions",
	{
		id: text("id").primaryKey(),
		organizationId: text("organizationId")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		name: text("name").notNull(), // Permission name (e.g., "manage_projects")
		description: text("description"), // Human-readable description
		category: text("category"), // Grouping category (e.g., "projects", "users")
		metadata: text("metadata"), // JSON field for additional permission data
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(table) => [
		// Ensure permission names are unique within an organization
		unique().on(table.organizationId, table.name),
		// Index for fast lookups by organization and category
		index().on(table.organizationId, table.category),
	],
);

// Resource Permissions table - stores permissions for specific resources
export const resourcePermissions = pgTable(
	"resource_permissions",
	{
		id: text("id").primaryKey(),
		organizationId: text("organizationId")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		userId: text("userId").references(() => users.id, { onDelete: "cascade" }), // Can be null for role-based permissions
		teamId: text("teamId").references(() => teams.id, { onDelete: "cascade" }), // Can be null for user-specific permissions
		resourceType: text("resourceType").notNull(), // project, document, etc.
		resourceId: text("resourceId").notNull(), // ID of the specific resource
		permission: text("permission").notNull(), // read, write, delete, manage, etc.
		granted: boolean("granted").notNull().default(true), // true = granted, false = denied
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(table) => [
		// Ensure no duplicate permissions for the same user/team on the same resource
		unique().on(
			table.userId,
			table.resourceType,
			table.resourceId,
			table.permission,
		),
		unique().on(
			table.teamId,
			table.resourceType,
			table.resourceId,
			table.permission,
		),
		// Index for fast lookups by resource
		index().on(table.resourceType, table.resourceId),
		// Index for fast lookups by organization
		index().on(table.organizationId),
		// Index for fast lookups by user
		index().on(table.userId),
		// Index for fast lookups by team
		index().on(table.teamId),
	],
);

// Organization Security Settings table - stores security settings per organization
export const organizationSecuritySettings = pgTable(
	"organization_security_settings",
	{
		id: text("id").primaryKey(),
		organizationId: text("organizationId")
			.notNull()
			.unique()
			.references(() => organizations.id, { onDelete: "cascade" }),
		enforcePasswordPolicy: boolean("enforcePasswordPolicy")
			.notNull()
			.default(false),
		minPasswordLength: text("minPasswordLength").default("8"), // Stored as text for flexibility
		requireTwoFactor: boolean("requireTwoFactor").notNull().default(false),
		sessionTimeout: text("sessionTimeout").default("24h"), // e.g., "1h", "24h", "7d"
		allowedEmailDomains: text("allowedEmailDomains"), // JSON array of allowed domains
		ipRestrictions: text("ipRestrictions"), // JSON array of allowed IP ranges
		metadata: text("metadata"), // JSON field for additional security settings
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
);

// User Security Settings table - stores user security preferences per organization
export const userSecuritySettings = pgTable(
	"user_security_settings",
	{
		id: text("id").primaryKey(),
		userId: text("userId")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		organizationId: text("organizationId")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		twoFactorEnabled: boolean("twoFactorEnabled").notNull().default(false),
		twoFactorSecret: text("twoFactorSecret"), // TOTP secret (encrypted)
		backupCodes: text("backupCodes"), // JSON array of backup codes (encrypted)
		lastPasswordChange: timestamp("lastPasswordChange"),
		securityQuestions: text("securityQuestions"), // JSON field for security questions
		metadata: text("metadata"), // JSON field for additional security data
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(table) => [
		// Ensure a user can only have one security setting per organization
		unique().on(table.userId, table.organizationId),
		// Index for fast lookups by organization
		index().on(table.organizationId),
	],
);

// Export types for type-safe database operations
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;

// Organization-related types
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;

// User preferences types
export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;

// New multi-tenant table types
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type UserTeam = typeof userTeams.$inferSelect;
export type NewUserTeam = typeof userTeams.$inferInsert;
export type CustomPermission = typeof customPermissions.$inferSelect;
export type NewCustomPermission = typeof customPermissions.$inferInsert;
export type ResourcePermission = typeof resourcePermissions.$inferSelect;
export type NewResourcePermission = typeof resourcePermissions.$inferInsert;
export type OrganizationSecuritySettings =
	typeof organizationSecuritySettings.$inferSelect;
export type NewOrganizationSecuritySettings =
	typeof organizationSecuritySettings.$inferInsert;
export type UserSecuritySettings = typeof userSecuritySettings.$inferSelect;
export type NewUserSecuritySettings = typeof userSecuritySettings.$inferInsert;
