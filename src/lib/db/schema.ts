import {
	boolean,
	index,
	integer,
	json,
	pgTable,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";
import { defaultLocale } from "@/modules/i18n/routing";

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

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified")
		.$defaultFn(() => false)
		.notNull(),
	image: text("image"),
	createdAt: timestamp("created_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	role: text("role"),
	banned: boolean("banned"),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires"),
	language: text("language").default("en"),
	stripeCustomerId: text("stripe_customer_id"),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	impersonatedBy: text("impersonated_by"),
	activeOrganizationId: text("active_organization_id"),
	activeTeamId: text("active_team_id"),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	updatedAt: timestamp("updated_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
});

export const organization = pgTable("organization", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").unique(),
	logo: text("logo"),
	createdAt: timestamp("created_at").notNull(),
	metadata: text("metadata"),
});

export const member = pgTable("member", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	role: text("role").default("member").notNull(),
	createdAt: timestamp("created_at").notNull(),
});

export const invitation = pgTable("invitation", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	email: text("email").notNull(),
	role: text("role"),
	teamId: text("team_id"),
	status: text("status").default("pending").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	inviterId: text("inviter_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const team = pgTable("team", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at"),
});

export const teamMember = pgTable("team_member", {
	id: text("id").primaryKey(),
	teamId: text("team_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at"),
});

// User Preferences table - stores user preferences per organization (MULTI-TENANT)
export const userPreference = pgTable(
	"user_preference",
	{
		id: text("id").primaryKey(),
		userId: text("userId")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		// Multi-tenant: Each user can have different preferences per organization
		organizationId: text("organizationId")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		language: text("language").notNull().default(defaultLocale), // User's preferred language
		theme: text("theme").default("system"), // Theme preference: light, dark, system
		timezone: text("timezone").default("UTC"), // User's timezone preference
		emailNotifications: boolean("emailNotifications").notNull().default(true), // Email notification preference
		// JSON field for additional preferences that might be added in the future
		additionalPreferences: text("additionalPreferences"), // Store as JSON string
		createdAt: timestamp("createdAt").notNull().defaultNow(),
		updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	},
	(table) => [
		// Ensure a user can only have one preference set per organization
		unique().on(table.userId, table.organizationId),
		// Index for fast lookups by organization
		index().on(table.organizationId),
	],
);

export const subscription = pgTable("subscription", {
	id: text("id").primaryKey(),
	plan: text("plan").notNull(), // The name of the subscription plan
	referenceId: text("reference_id").notNull(), // The ID this subscription is associated with (user ID by default)
	stripeCustomerId: text("stripe_customer_id"), // The Stripe customer ID
	stripeSubscriptionId: text("stripe_subscription_id"), // The Stripe subscription ID
	status: text("status").notNull(), // The status of the subscription (active, canceled, etc.)
	periodStart: timestamp("period_start"), // Start date of the current billing period
	periodEnd: timestamp("period_end"), // End date of the current billing period
	cancelAtPeriodEnd: boolean("cancel_at_period_end"), // Whether the subscription will be canceled at the end of the period
	seats: integer("seats"), // Number of seats for team plans
	trialStart: timestamp("trial_start"), // Start date of the trial period
	trialEnd: timestamp("trial_end"), // End date of the trial period
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const subject = pgTable("subject", {
	id: text("id").primaryKey(),
	isIdentified: boolean("is_identified").notNull(),
	externalId: text("external_id"),
	identityProvider: text("identity_provider"),
	lastIpAddress: text("last_ip_address"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	subjectTimezone: text("subject_timezone"),
});

export const consentPurpose = pgTable("consent_purpose", {
	id: text("id").primaryKey(),
	code: text("code").notNull(),
	name: text("name").notNull(),
	description: text("description").notNull(),
	isEssential: boolean("is_essential").notNull(),
	dataCategory: text("data_category"),
	legalBasis: text("legal_basis"),
	isActive: boolean("is_active").notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const consentPolicy = pgTable("consent_policy", {
	id: text("id").primaryKey(),
	version: text("version").notNull(),
	type: text("type").notNull(),
	name: text("name").notNull(),
	effectiveDate: timestamp("effective_date").notNull(),
	expirationDate: timestamp("expiration_date"),
	content: text("content").notNull(),
	contentHash: text("content_hash").notNull(),
	isActive: boolean("is_active").notNull(),
	createdAt: timestamp("created_at").notNull(),
});

export const domain = pgTable("domain", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	description: text("description"),
	allowedOrigins: json("allowed_origins"),
	isVerified: boolean("is_verified").notNull(),
	isActive: boolean("is_active").notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at"),
});

export const consent = pgTable("consent", {
	id: text("id").primaryKey(),
	subjectId: text("subject_id")
		.notNull()
		.references(() => subject.id, { onDelete: "cascade" }),
	domainId: text("domain_id")
		.notNull()
		.references(() => domain.id, { onDelete: "cascade" }),
	purposeIds: json("purpose_ids"),
	metadata: json("metadata"),
	policyId: text("policy_id").references(() => consentPolicy.id, {
		onDelete: "cascade",
	}),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	status: text("status").notNull(),
	withdrawalReason: text("withdrawal_reason"),
	givenAt: timestamp("given_at").notNull(),
	validUntil: timestamp("valid_until"),
	isActive: boolean("is_active").notNull(),
});

export const consentRecord = pgTable("consent_record", {
	id: text("id").primaryKey(),
	subjectId: text("subject_id")
		.notNull()
		.references(() => subject.id, { onDelete: "cascade" }),
	consentId: text("consent_id").references(() => consent.id, {
		onDelete: "cascade",
	}),
	actionType: text("action_type").notNull(),
	details: json("details"),
	createdAt: timestamp("created_at").notNull(),
});

export const auditLog = pgTable("audit_log", {
	id: text("id").primaryKey(),
	entityType: text("entity_type").notNull(),
	entityId: text("entity_id").notNull(),
	actionType: text("action_type").notNull(),
	subjectId: text("subject_id").references(() => subject.id, {
		onDelete: "cascade",
	}),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	changes: json("changes"),
	metadata: json("metadata"),
	createdAt: timestamp("created_at").notNull(),
	eventTimezone: text("event_timezone").notNull(),
});

// Export types for type-safe database operations
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;
export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

// Organization-related types
export type Organization = typeof organization.$inferSelect;
export type NewOrganization = typeof organization.$inferInsert;
export type Member = typeof member.$inferSelect;
export type NewMember = typeof member.$inferInsert;
export type Invitation = typeof invitation.$inferSelect;
export type NewInvitation = typeof invitation.$inferInsert;

// User preferences types
export type UserPreferences = typeof userPreference.$inferSelect;
export type NewUserPreferences = typeof userPreference.$inferInsert;

// New multi-tenant table types
export type Team = typeof team.$inferSelect;
export type NewTeam = typeof team.$inferInsert;
export type TeamMember = typeof teamMember.$inferSelect;
export type NewTeamMember = typeof teamMember.$inferInsert;

// Subscription types
export type Subscription = typeof subscription.$inferSelect;
export type NewSubscription = typeof subscription.$inferInsert;
