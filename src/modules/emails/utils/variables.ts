/**
 * Helper function to replace variables in translated strings
 * Handles placeholders like {appName}, {userName}, {year}, etc.
 *
 * @param text - The text string containing placeholders
 * @param variables - Object with key-value pairs for replacement
 * @returns The text with all placeholders replaced with actual values
 *
 * @example
 * ```typescript
 * const result = replaceVariables(
 *   "Welcome to {appName}, {userName}!",
 *   { appName: "My App", userName: "John" }
 * );
 * // Returns: "Welcome to My App, John!"
 * ```
 */
export function replaceVariables(
	text: string,
	variables: Record<string, string | number>,
): string {
	return text.replace(/\{(\w+)\}/g, (match, key) => {
		return String(variables[key] || match);
	});
}

/**
 * Common variables used across email templates
 * This type defines the standard set of variables that can be used
 * in email template translations
 */
export type EmailVariables = Record<string, string | number> & {
	/** Application name */
	appName: string;
	/** User's name */
	userName?: string;
	/** User's email address */
	userEmail?: string;
	/** Current year for copyright notices */
	year: number;
	/** Organization name */
	organizationName?: string;
	/** Inviter's name */
	inviterName?: string;
	/** Inviter's email */
	inviterEmail?: string;
	/** User role */
	role?: string;
	/** Expiration hours for links */
	expirationHours?: number;
	/** Subscription plan name */
	planName?: string;
	/** Subscription plan price (formatted) */
	planPrice?: string;
	/** Billing cycle (monthly, yearly, etc.) */
	billingCycle?: string;
	/** Next billing date (formatted) */
	nextBillingDate?: string;
};

/**
 * Creates a standard set of variables for email templates
 * @param overrides - Specific variables to set or override
 * @returns Complete EmailVariables object with defaults
 */
export function createEmailVariables(
	overrides: Partial<EmailVariables> = {},
): EmailVariables {
	return {
		appName: "My App",
		year: new Date().getFullYear(),
		...overrides,
	};
}
