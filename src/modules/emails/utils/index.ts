import { render } from "@react-email/render";
import { env } from "@/lib/env";
import { sendVerificationEmail } from "../services";

/**
 * Email Utilities
 *
 * Utility functions for testing and working with emails
 */

/**
 * Render any email template to HTML
 *
 * Useful for testing and previewing email templates
 */
export async function renderEmailTemplate(
	template: React.ReactElement,
): Promise<string> {
	return render(template);
}

/**
 * Send a test email for development
 *
 * Sends a test verification email to verify email functionality
 */
export async function sendTestEmail(to: string): Promise<void> {
	await sendVerificationEmail({
		to,
		userName: "Test User",
		verificationUrl: `${env.NEXT_PUBLIC_APP_URL}/verify-email?token=test-token`,
	});
}

/**
 * Validate email address format
 *
 * Simple email validation using a regex pattern
 */
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Extract domain from email address
 *
 * Useful for email analytics or domain-based logic
 */
export function getEmailDomain(email: string): string {
	return email.split("@")[1] || "";
}

/**
 * Mask email address for privacy
 *
 * Masks the local part of email for logging or display
 * Example: user@domain.com → u***@domain.com
 */
export function maskEmail(email: string): string {
	if (!isValidEmail(email)) {
		return email;
	}

	const [local, domain] = email.split("@");
	if (local.length <= 2) {
		return `${local[0]}***@${domain}`;
	}

	return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}
