import { render } from "@react-email/render";
import { env } from "@/lib/env";
import { EMAIL_CONFIG } from "../config";
import { getEmailProvider } from "../providers";
import EmailVerification from "../templates/email-verification";

/**
 * Password Reset Email Service
 *
 * Handles rendering and sending password reset emails
 * Used by Better Auth for password reset workflow
 */
export interface SendPasswordResetEmailOptions {
	to: string;
	userName?: string;
	resetUrl: string;
	locale?: string;
}

export async function sendPasswordResetEmail({
	to,
	userName,
	resetUrl,
	locale = "en",
}: SendPasswordResetEmailOptions): Promise<void> {
	try {
		// Import the translation utilities here to avoid client-side issues
		const { getLocaleTranslations, isLocaleSupported } = await import(
			"@/modules/i18n/utils"
		);

		// Determine the locale to use
		const validLocale = isLocaleSupported(locale) ? locale : "en";

		// Load translations for the email
		const t = await getLocaleTranslations(validLocale, "Email.passwordReset");

		// Get the translated subject
		const subject = t("subject", { appName: env.NEXT_PUBLIC_APP_NAME });

		// For now, use the verification template for password reset
		// You can create a dedicated password reset template later
		const emailHtml = await render(
			EmailVerification({
				userEmail: to,
				userName: userName || "there",
				verificationUrl: resetUrl,
				appName: env.NEXT_PUBLIC_APP_NAME,
				logoUrl: env.APP_LOGO_URL,
				expirationHours: EMAIL_CONFIG.templates.passwordReset.expirationHours,
			}),
		);

		// Get the email provider and send the email
		const emailProvider = getEmailProvider();
		await emailProvider.sendEmail({
			to,
			subject,
			html: emailHtml,
		});

		console.log(
			`✅ Password reset email sent successfully to ${to} in ${validLocale}`,
		);
	} catch (error) {
		console.error("❌ Failed to send password reset email:", error);
		throw new Error("Failed to send password reset email");
	}
}
