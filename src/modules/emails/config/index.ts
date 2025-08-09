/**
 * Email Configuration
 *
 * Centralized configuration for all email templates and settings
 * This includes default values, timeouts, and app-specific settings
 */
export const EMAIL_CONFIG = {
	// Template defaults
	defaults: {
		expirationHours: 24,
		passwordResetExpirationHours: 1,
		invitationExpirationHours: 72,
	},

	// Email settings
	settings: {
		maxRetries: 3,
		retryDelay: 1000, // milliseconds
	},

	// Template-specific configurations
	templates: {
		verification: {
			expirationHours: 24,
		},
		passwordReset: {
			expirationHours: 1,
		},
		invitation: {
			expirationHours: 72,
		},
		welcome: {
			// Welcome emails don't expire
		},
	},
} as const;

/**
 * Email template types
 */
export type EmailTemplateType = keyof typeof EMAIL_CONFIG.templates;

// Custom Tailwind configuration for email compatibility
export const TAILWIND_CONFIG = {
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: "#F46811", // Using orange as primary for better email client compatibility
				},
			},
		},
	},
};
