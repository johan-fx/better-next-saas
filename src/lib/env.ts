import { z } from "zod";

/**
 * Environment Variables Schema
 *
 * This validates all required environment variables for the application:
 * - Database connection
 * - Better Auth configuration
 * - Social authentication providers
 * - E2E testing configuration (MailDev)
 */
const envSchema = z
	.object({
		// App Configuration
		APP_NAME: z.string().optional().default("My App"),
		APP_LOGO_URL: z.string().url("Invalid logo URL").optional(),
		APP_SUPPORT_EMAIL: z
			.string()
			.email("Invalid support email address")
			.optional(),
		APP_DEFAULT_LOCALE: z.string().optional().default("en"),

		EMAIL_VERIFICATION_TOKEN_EXPIRES_IN: z.number().int().positive().optional(),

		// Email testing
		MAILSLURP_API_KEY: z.string().optional(),

		// MailDev Configuration (for E2E testing)
		MAILDEV_WEB_URL: z
			.string()
			.url("Invalid MailDev web URL")
			.optional()
			.default("http://localhost:1080"),
		MAILDEV_SMTP_HOST: z.string().optional().default("localhost"),
		MAILDEV_SMTP_PORT: z.string().optional().default("1025"),
		MAILDEV_USERNAME: z.string().optional(),
		MAILDEV_PASSWORD: z.string().optional(),

		// Database
		DATABASE_URL: z.string().url("Invalid database URL"),

		// Better Auth
		BETTER_AUTH_SECRET: z
			.string()
			.min(32, "Auth secret must be at least 32 characters"),
		BETTER_AUTH_URL: z.string().url("Invalid auth URL").optional(),

		// Social Providers (optional)
		GITHUB_CLIENT_ID: z.string().optional(),
		GITHUB_CLIENT_SECRET: z.string().optional(),
		GOOGLE_CLIENT_ID: z.string().optional(),
		GOOGLE_CLIENT_SECRET: z.string().optional(),

		// App Configuration
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		NEXT_PUBLIC_APP_URL: z.string().url().optional(),

		// SMTP Email (optional except FROM when SMTP_HOST is defined)
		SMTP_HOST: z.string().optional(),
		SMTP_PORT: z.string().optional(), // string for compatibility, convert to number later
		SMTP_USER: z.string().optional(),
		SMTP_PASS: z.string().optional(),
		SMTP_FROM: z.string().email("Invalid SMTP FROM email address").optional(),
	})
	.refine(
		(data) => {
			// If SMTP_HOST is defined, SMTP_FROM must also be defined
			if (data.SMTP_HOST && !data.SMTP_FROM) {
				return false;
			}
			return true;
		},
		{
			message: "SMTP_FROM is required when SMTP_HOST is defined",
			path: ["SMTP_FROM"], // This will show the error on the SMTP_FROM field
		},
	);

/**
 * Validated Environment Variables
 *
 * This object contains all validated environment variables.
 * It will throw an error if any required variables are missing or invalid.
 */
export const env = envSchema.parse({
	// App Configuration
	APP_NAME: process.env.APP_NAME,
	APP_LOGO_URL: process.env.APP_LOGO_URL,
	APP_SUPPORT_EMAIL: process.env.APP_SUPPORT_EMAIL,
	APP_DEFAULT_LOCALE: process.env.APP_DEFAULT_LOCALE,

	EMAIL_VERIFICATION_TOKEN_EXPIRES_IN: Number(
		process.env.EMAIL_VERIFICATION_TOKEN_EXPIRES_IN ?? "24",
	),

	// Email testing
	MAILSLURP_API_KEY: process.env.MAILSLURP_API_KEY,

	// MailDev Configuration
	MAILDEV_WEB_URL: process.env.MAILDEV_WEB_URL,
	MAILDEV_SMTP_HOST: process.env.MAILDEV_SMTP_HOST,
	MAILDEV_SMTP_PORT: process.env.MAILDEV_SMTP_PORT,
	MAILDEV_USERNAME: process.env.MAILDEV_USERNAME,
	MAILDEV_PASSWORD: process.env.MAILDEV_PASSWORD,

	// Database
	DATABASE_URL: process.env.DATABASE_URL,

	// Better Auth
	BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
	BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,

	// Social Providers
	GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

	// App Configuration
	NODE_ENV: process.env.NODE_ENV,
	NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,

	// SMTP Email
	SMTP_HOST: process.env.SMTP_HOST,
	SMTP_PORT: process.env.SMTP_PORT,
	SMTP_USER: process.env.SMTP_USER,
	SMTP_PASS: process.env.SMTP_PASS,
	SMTP_FROM: process.env.SMTP_FROM,
});

// Export the type for use in other files
export type Env = typeof env;
