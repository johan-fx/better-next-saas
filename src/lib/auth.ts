import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, organization } from "better-auth/plugins";
import slugify from "slugify";
import { MIN_PASSWORD_LENGTH } from "@/modules/auth/constants";
import { getDefaultOrganization } from "@/modules/auth/server/utils";
import { plans } from "@/modules/billing/plans";
import {
	authorizeSubscription,
	onSubscriptionCancel,
	onSubscriptionComplete,
} from "@/modules/billing/server/subscriptions";
import {
	sendInvitationEmail,
	sendPasswordResetEmail,
	sendVerificationEmail,
} from "@/modules/emails";
import { defaultLocale } from "@/modules/i18n/routing";
import { getPreferredLanguage } from "@/modules/i18n/utils";
import { db } from "./db";
import * as schema from "./db/schema";
import { env } from "./env";
import { getTrustedOrigins } from "./server-utils";
import { isStripeEnabled, stripeClient } from "./stripe";

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

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
		schema: { ...schema },
	}),

	user: {
		additionalFields: {
			language: {
				type: "string",
				required: false,
				defaultValue: defaultLocale, // Default locale for new users
				input: true, // Allow users to set this field during signup
			},
		},
		changeEmail: {
			enabled: true,
			// Email sending function
			sendChangeEmailVerification: async ({ user, newEmail, url }, request) => {
				const preferredLanguage =
					(user as schema.User).language ?? getPreferredLanguage(request);

				await sendVerificationEmail({
					to: newEmail,
					userName: user.name || undefined,
					verificationUrl: url,
					locale: preferredLanguage,
				});
			},
		},
	},

	// Database hooks
	databaseHooks: {
		user: {
			create: {
				before: async (user, ctx) => {
					const language = ctx?.getCookie("NEXT_LOCALE") ?? defaultLocale;

					return {
						data: {
							...user,
							language,
						},
					};
				},
			},
		},
		session: {
			create: {
				before: async (session) => {
					const defaultOrganization = await getDefaultOrganization(
						session.userId,
					);

					return {
						data: {
							...session,
							activeOrganizationId: defaultOrganization?.id ?? undefined,
						},
					};
				},
			},
		},
	},

	// Plugins
	plugins: [
		// Admin plugin for system-wide user management
		admin({
			impersonationSessionDuration: 60 * 60 * 24 * 7, // 7 days
		}),

		organization({
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
				// afterCreate: organizationCreationHook,
			},

			// Invitation email configuration
			sendInvitationEmail: async (data, request) => {
				// Build the invitation link
				const inviteLink = `${env.NEXT_PUBLIC_APP_URL}/accept-invitation/${data.id}`;
				const { name, email, language } = data.inviter.user as schema.User;

				// Send the invitation email using the new template
				await sendInvitationEmail({
					to: data.email,
					organizationName: data.organization.name,
					inviterName: name ?? "A team member",
					inviterEmail: email,
					role: data.role,
					inviteLink,
					locale: language ?? getPreferredLanguage(request),
				});
			},
		}),

		// Stripe plugin for payment integration (only if API key is provided)
		...(isStripeEnabled && stripeClient
			? [
					stripe({
						stripeClient,
						stripeWebhookSecret: stripeWebhookSecret,
						createCustomerOnSignUp: true,
						subscription: {
							enabled: true,
							plans: plans,
							authorizeReference: authorizeSubscription,
							onSubscriptionComplete: onSubscriptionComplete,
							onSubscriptionCancel: onSubscriptionCancel,
						},
					}),
				]
			: []),
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
		sendVerificationEmail: async ({ user, url }, request) => {
			const preferredLanguage =
				(user as schema.User).language ?? getPreferredLanguage(request);

			await sendVerificationEmail({
				to: user.email,
				userName: user.name || undefined,
				verificationUrl: url,
				locale: preferredLanguage,
			});
		},
	},

	// Email and password authentication
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true, // Enable email verification
		minPasswordLength: MIN_PASSWORD_LENGTH,

		// Password reset configuration
		sendResetPassword: async ({ user, url }, request) => {
			const preferredLanguage = getPreferredLanguage(request);

			await sendPasswordResetEmail({
				to: user.email,
				userName: user.name || undefined,
				resetUrl: url,
				locale: preferredLanguage,
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
					mapProfileToUser: (profile) => {
						return {
							firstName: profile.name.split(" ")[0],
							lastName: profile.name.split(" ")[1],
						};
					},
				},
			}),
		...(env.GOOGLE_CLIENT_ID &&
			env.GOOGLE_CLIENT_SECRET && {
				google: {
					prompt: "select_account",
					clientId: env.GOOGLE_CLIENT_ID,
					clientSecret: env.GOOGLE_CLIENT_SECRET,
					mapProfileToUser: (profile) => {
						return {
							firstName: profile.given_name,
							lastName: profile.family_name,
						};
					},
				},
			}),
	},

	// Session configuration
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24 * 7, // 7 days (every 7 days the session is updated)
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5, // 5 minutes
		},
	},

	// Advanced configuration
	advanced: {
		useSecureCookies: env.NODE_ENV === "production",
		cookiePrefix: slugify(env.NEXT_PUBLIC_APP_NAME),
	},

	rateLimit: {
		window: 15 * 60 * 1000, // 15 minutes
		max: 100, // max requests per window per IP
	},

	// Authentication secret
	secret: env.BETTER_AUTH_SECRET,

	// Base URL
	baseURL: env.BETTER_AUTH_URL,
	trustedOrigins: getTrustedOrigins(),
});

// Export types for use throughout the application
export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;
