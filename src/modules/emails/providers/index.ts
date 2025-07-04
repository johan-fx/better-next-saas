import { env } from "@/lib/env";
import type { EmailProvider } from "./base";
import { ConsoleEmailProvider } from "./console";
import { SmtpEmailProvider } from "./smtp";

/**
 * Email Provider Factory
 *
 * Automatically selects the appropriate email provider based on environment
 * In development: Uses console logging
 * In production: Uses SMTP if configured, otherwise falls back to console
 */
export function createEmailProvider(): EmailProvider {
	// Check if SMTP is fully configured
	const hasSmtpConfig =
		env.SMTP_HOST &&
		env.SMTP_PORT &&
		env.SMTP_USER &&
		env.SMTP_PASS &&
		env.SMTP_FROM;

	// Use SMTP provider if all credentials are present
	if (hasSmtpConfig) {
		try {
			return new SmtpEmailProvider();
		} catch (error) {
			console.warn(
				"⚠️  SMTP provider failed to initialize, falling back to console provider:",
				error,
			);
			return new ConsoleEmailProvider();
		}
	}

	// In development, use console provider
	if (env.NODE_ENV === "development") {
		return new ConsoleEmailProvider();
	}

	// Fallback to console for production if no SMTP config
	console.warn(
		"⚠️  No email provider configured for production. Using console provider.",
	);
	return new ConsoleEmailProvider();
}

/**
 * Get the configured email provider instance
 *
 * This is a singleton pattern - the provider is created once and reused
 */
let emailProviderInstance: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
	if (!emailProviderInstance) {
		emailProviderInstance = createEmailProvider();
	}
	return emailProviderInstance;
}

export type { EmailProvider, SendEmailOptions } from "./base";
// Export provider classes for direct use if needed
export { ConsoleEmailProvider } from "./console";
export { SmtpEmailProvider } from "./smtp";
