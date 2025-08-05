import { render } from "@react-email/render";
import { env } from "@/lib/env";
import { getLocaleTranslations, isLocaleSupported } from "@/modules/i18n/utils";
import { EMAIL_CONFIG } from "../config";
import { getEmailProvider } from "../providers";
import EmailVerification from "../templates/email-verification";

/**
 * Email Verification Service
 *
 * Handles rendering and sending email verification emails
 * Used by Better Auth for email verification workflow
 */
export interface SendVerificationEmailOptions {
	to: string;
	userName?: string;
	verificationUrl: string;
	locale?: string;
}

export async function sendVerificationEmail({
	to,
	userName,
	verificationUrl,
	locale = "en",
}: SendVerificationEmailOptions): Promise<void> {
	try {
		// Determine the locale to use
		const validLocale = isLocaleSupported(locale) ? locale : "en";

		// Load translations for the email
		const t = await getLocaleTranslations(validLocale, "Email.verification");

		// Get the translated subject
		const subject = t("subject", { appName: env.APP_NAME });

		// Render the email template to HTML
		const emailHtml = await render(
			EmailVerification({
				userEmail: to,
				userName: userName || "there",
				verificationUrl,
				appName: env.APP_NAME,
				logoUrl: env.APP_LOGO_URL,
				expirationHours: EMAIL_CONFIG.templates.verification.expirationHours,
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
			`✅ Email verification sent successfully to ${to} in ${validLocale}`,
		);
	} catch (error) {
		console.error("❌ Failed to send verification email:", error);
		throw new Error("Failed to send verification email");
	}
}
