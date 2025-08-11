import { render } from "@react-email/render";
import { env } from "@/lib/env";
import { getEmailProvider } from "../providers";
import SubscriptionCancellationEmail from "../templates/subscription-cancellation";

/**
 * Subscription Cancellation Email Service
 *
 * Sends an internationalized email when a subscription is cancelled. It includes
 * the effective cancellation date and optional cancellation reason when available.
 */
export interface SendSubscriptionCancellationEmailOptions {
	to: string;
	userName: string;
	dashboardUrl: string;
	planName: string;
	effectiveDate: string;
	cancellationReason?: string | null;
	locale?: string;
}

export async function sendSubscriptionCancellationEmail({
	to,
	userName,
	dashboardUrl,
	planName,
	effectiveDate,
	cancellationReason,
	locale = "en",
}: SendSubscriptionCancellationEmailOptions): Promise<void> {
	try {
		// Import the translation utilities here to avoid client-side issues
		const { getLocaleTranslations, isLocaleSupported } = await import(
			"@/modules/i18n/utils"
		);

		const validLocale = isLocaleSupported(locale) ? locale : "en";

		// Load translations for the email
		const t = await getLocaleTranslations(
			validLocale,
			"Email.subscriptionCancellation",
		);

		const translations = {
			subject: t("subject", { appName: env.NEXT_PUBLIC_APP_NAME }),
			title: t("title"),
			greeting: t("greeting", { userName }),
			cancellationMessage: t("cancellationMessage", {
				planName,
				appName: env.NEXT_PUBLIC_APP_NAME,
				effectiveDate,
			}),
			details: t("details"),
			plan: t("plan"),
			effectiveDateLabel: t("effectiveDateLabel"),
			cancellationReasonLabel: t("cancellationReasonLabel"),
			accessDashboard: t("accessDashboard"),
			accountDetails: t("accountDetails"),
			email: t("email"),
			cancellationRequested: t("cancellationRequested"),
			footer: t("footer", { appName: env.NEXT_PUBLIC_APP_NAME }),
			copyright: t("copyright", {
				year: new Date().getFullYear(),
				appName: env.NEXT_PUBLIC_APP_NAME,
			}),
		};

		// Render the email template to HTML
		const emailHtml = await render(
			SubscriptionCancellationEmail({
				userEmail: to,
				userName,
				dashboardUrl,
				planName,
				effectiveDate,
				cancellationReason: cancellationReason || undefined,
				locale: validLocale,
				appName: env.NEXT_PUBLIC_APP_NAME,
				logoUrl: env.APP_LOGO_URL,
				translations,
			}),
		);

		// Get the email provider and send the email
		const emailProvider = getEmailProvider();
		await emailProvider.sendEmail({
			to,
			subject: translations.subject,
			html: emailHtml,
		});

		console.log(
			`✅ Subscription cancellation email sent successfully to ${to} for plan ${planName} in ${validLocale}`,
		);
	} catch (error) {
		console.error("❌ Failed to send subscription cancellation email:", error);
		throw new Error("Failed to send subscription cancellation email");
	}
}
