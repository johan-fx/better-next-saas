import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, organization } from "better-auth/plugins";
import slugify from "slugify";
import {
	sendInvitationEmail,
	sendPasswordResetEmail,
	sendVerificationEmail,
} from "@/modules/emails";
import { defaultLocale } from "@/modules/i18n/routing";
import { resolveLocaleFromHeaders } from "@/modules/i18n/utils";
import { ac, roles } from "@/modules/rbac/permissions";
import { createDefaultPreferences } from "@/modules/users/server/utils/user-preferences";
import { db } from "./db";
import * as schema from "./db/schema";
import { env } from "./env";

/**
 * Better Auth Configuration
 *
 * This setup provides:
 * - Email/password authentication
 * - Social authentication (GitHub, Google)
 * - Session management
 * - User management
 * - Organization management
 * - Role-based permissions
 * - Type-safe authentication context
 */
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: schema.users,
			session: schema.sessions,
			account: schema.accounts,
			verification: schema.verifications,
			// Organization tables
			organization: schema.organizations,
			member: schema.members,
			invitation: schema.invitations,
			// User preferences table
			userPreferences: schema.userPreferences,
		},
	}),

	// Database hooks
	databaseHooks: {
		// Note: User preferences are created when they join organizations
		// since preferences are per-organization in this multi-tenant setup
	},

	// Plugins
	plugins: [
		// Admin plugin for system-wide user management
		admin({
			// Access control configuration for admin operations
			ac,
			roles,
		}),

		organization({
			// Access control configuration
			ac,
			roles,

			// Teams configuration
			teams: {
				enabled: true,
				allowRemovingAllTeams: false, // Optional: prevent removing the last team
				/*
				maximumTeams: async ({ organizationId, session }, request) => {
					// Dynamic limit based on organization plan
					const plan = await getPlan(organizationId)
					return plan === 'pro' ? 20 : 5
				},
        */
			},

			// Organization creation settings
			allowUserToCreateOrganization: true,

			// Organization creation hooks
			organizationCreation: {
				beforeCreate: async ({ organization, user }) => {
					// Add any custom logic before organization creation
					// For example, validate organization data or check user limits
					console.log(
						`Creating organization "${organization.name}" for user ${user.email}`,
					);

					return {
						data: {
							...organization,
							// Add any additional metadata
							metadata: JSON.stringify({
								createdBy: user.id,
								createdAt: new Date().toISOString(),
							}),
						},
					};
				},
				afterCreate: async ({ organization, member, user }, request) => {
					// Create default user preferences for the new organization
					try {
						// Extract preferred language from request context or use default
						const preferredLanguage =
							resolveLocaleFromHeaders(request?.headers ?? new Headers()) ??
							defaultLocale;

						await createDefaultPreferences(user.id, {
							organizationId: organization.id,
							language: preferredLanguage,
						});

						console.log(
							`Created user preferences for ${user.email} in organization "${organization.name}"`,
						);
					} catch (error) {
						console.error("Failed to create user preferences:", error);
					}

					// Add any custom logic after organization creation
					// For example, create default resources or send notifications
					console.log(
						`Organization "${organization.name}" created successfully with member ${member.id} for user ${user.email}`,
					);
				},
			},

			// Invitation email configuration
			sendInvitationEmail: async (data) => {
				// Build the invitation link
				const inviteLink = `${env.NEXT_PUBLIC_APP_URL}/accept-invitation/${data.id}`;

				// Send the invitation email using the new template
				await sendInvitationEmail({
					to: data.email,
					organizationName: data.organization.name,
					inviterName: data.inviter.user.name || "A team member",
					inviterEmail: data.inviter.user.email,
					role: data.role,
					inviteLink,
				});
			},
		}),
	],

	// Email verification configuration
	emailVerification: {
		// Send verification email on sign up
		sendOnSignUp: true,

		// Auto sign in after verification
		autoSignInAfterVerification: true,

		// Token expiration (24 hours)
		expiresIn: 60 * 60 * Number(env.EMAIL_VERIFICATION_TOKEN_EXPIRES_IN),

		// Email sending function
		sendVerificationEmail: async ({ user, url }) => {
			await sendVerificationEmail({
				to: user.email,
				userName: user.name || undefined,
				verificationUrl: url,
			});
		},
	},

	// Email and password authentication
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true, // Enable email verification

		// Password reset configuration
		sendResetPassword: async ({ user, url }) => {
			await sendPasswordResetEmail({
				to: user.email,
				userName: user.name || undefined,
				resetUrl: url,
			});
		},
	},

	// Social authentication providers (only if credentials are provided)
	socialProviders: {
		...(env.GITHUB_CLIENT_ID &&
			env.GITHUB_CLIENT_SECRET && {
				github: {
					clientId: env.GITHUB_CLIENT_ID,
					clientSecret: env.GITHUB_CLIENT_SECRET,
				},
			}),
		...(env.GOOGLE_CLIENT_ID &&
			env.GOOGLE_CLIENT_SECRET && {
				google: {
					clientId: env.GOOGLE_CLIENT_ID,
					clientSecret: env.GOOGLE_CLIENT_SECRET,
				},
			}),
	},

	// Session configuration
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
	},

	// Advanced configuration
	advanced: {
		useSecureCookies: env.NODE_ENV === "production",
		cookiePrefix: slugify(env.APP_NAME),
	},

	// Authentication secret
	secret: env.BETTER_AUTH_SECRET,

	// Base URL
	baseURL: env.BETTER_AUTH_URL,

	// After hook: send welcome email after successful verification
	/*
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/auth/verify-email" && ctx.context.session?.user) {
        try {
          const userLocale = resolveLocaleFromHeaders(
            ctx.headers ?? new Headers()
          );

          await sendWelcomeEmail({
            to: ctx.context.session.user.email,
            userName: ctx.context.session.user.name || "there",
            dashboardUrl: `${env.NEXT_PUBLIC_APP_URL}/${userLocale}/dashboard`,
            locale: userLocale,
          });
        } catch (error) {
          console.error("Failed to send welcome email:", error);
        }
      }
    }),
  },
  */
});

// Export types for use throughout the application
export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;
