import { render } from "@react-email/render";
import { env } from "@/lib/env";
import { getEmailProvider } from "../providers";
import SubscriptionUpgradeEmail from "../templates/subscription-upgrade";

/**
 * Subscription Notification Email Service
 *
 * Handles rendering and sending internationalized subscription notification emails
 * Loads translations server-side and passes them to the template
 */
export interface SendSubscriptionUpgradeEmailOptions {
	to: string;
	userName: string;
	dashboardUrl: string;
	planName: string;
	planPrice: string;
	billingCycle: string;
	nextBillingDate: string;
	locale?: string;
}

export async function sendSubscriptionUpgradeEmail({
	to,
	userName,
	dashboardUrl,
	planName,
	planPrice,
	billingCycle,
	nextBillingDate,
	locale = "en",
}: SendSubscriptionUpgradeEmailOptions): Promise<void> {
	try {
		// Import the translation utilities here to avoid client-side issues
		const { getLocaleTranslations, isLocaleSupported } = await import(
			"@/modules/i18n/utils"
		);

		// Determine the locale to use
		const validLocale = isLocaleSupported(locale) ? locale : "en";

		// Load translations for the email
		const t = await getLocaleTranslations(validLocale, "Email.subscription");

		// Prepare translations object
		const translations = {
			subject: t("subject", { appName: env.APP_NAME }),
			title: t("title"),
			greeting: t("greeting", { userName }),
			confirmation: t("confirmation", {
				planName,
				appName: env.APP_NAME,
			}),
			subscriptionDetails: t("subscriptionDetails"),
			plan: t("plan"),
			price: t("price"),
			nextBilling: t("nextBilling"),
			accessDashboard: t("accessDashboard"),
			whatsNext: t("whatsNext"),
			step1: t("step1"),
			step2: t("step2"),
			step3: t("step3"),
			step4: t("step4"),
			premiumFeatures: t("premiumFeatures"),
			feature1Title: t("feature1Title"),
			feature1Description: t("feature1Description"),
			feature2Title: t("feature2Title"),
			feature2Description: t("feature2Description"),
			feature3Title: t("feature3Title"),
			feature3Description: t("feature3Description"),
			feature4Title: t("feature4Title"),
			feature4Description: t("feature4Description"),
			billingInfo: t("billingInfo"),
			accountDetails: t("accountDetails"),
			email: t("email"),
			subscriptionDate: t("subscriptionDate"),
			footer: t("footer", { appName: env.APP_NAME }),
			copyright: t("copyright", {
				year: new Date().getFullYear(),
				appName: env.APP_NAME,
			}),
		};

		// Render the email template to HTML
		const emailHtml = await render(
			SubscriptionUpgradeEmail({
				userEmail: to,
				userName,
				dashboardUrl,
				planName,
				planPrice,
				billingCycle,
				nextBillingDate,
				locale: validLocale,
				appName: env.APP_NAME,
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
			`✅ Subscription notification email sent successfully to ${to} for plan ${planName} in ${validLocale}`,
		);
	} catch (error) {
		console.error("❌ Failed to send subscription notification email:", error);
		throw new Error("Failed to send subscription notification email");
	}
}
