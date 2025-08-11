import { render } from "@react-email/render";
import { env } from "@/lib/env";
import { getEmailProvider } from "../providers";
import InvitationEmail from "../templates/invitation";

/**
 * Invitation Email Service
 *
 * Handles rendering and sending invitation emails
 * Used for organization invitations
 */
export interface SendInvitationEmailOptions {
	to: string;
	organizationName: string;
	inviterName: string;
	inviterEmail: string;
	role: string;
	inviteLink: string;
	locale?: string;
}

export async function sendInvitationEmail({
	to,
	organizationName,
	inviterName,
	inviterEmail,
	role,
	inviteLink,
	locale = "en",
}: SendInvitationEmailOptions): Promise<void> {
	try {
		// Import the translation utilities here to avoid client-side issues
		const { getLocaleTranslations, isLocaleSupported } = await import(
			"@/modules/i18n/utils"
		);

		// Determine the locale to use
		const validLocale = isLocaleSupported(locale) ? locale : "en";

		// Load translations for the email
		const t = await getLocaleTranslations(validLocale, "Email.invitation");

		// Get the translated subject
		const subject = t("subject", {
			organizationName,
			appName: env.NEXT_PUBLIC_APP_NAME,
		});

		// Render the email template to HTML
		const emailHtml = await render(
			InvitationEmail({
				organizationName,
				inviterName,
				inviterEmail,
				role,
				inviteLink,
				appName: env.NEXT_PUBLIC_APP_NAME,
				logoUrl: env.APP_LOGO_URL,
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
			`✅ Invitation email sent successfully to ${to} in ${validLocale}`,
		);
	} catch (error) {
		console.error("❌ Failed to send invitation email:", error);
		throw new Error("Failed to send invitation email");
	}
}
