import { render } from "@react-email/render";
import { env } from "@/lib/env";
import { getEmailProvider } from "../providers";
import WelcomeEmail from "../templates/welcome";

/**
 * Welcome Email Service
 *
 * Handles rendering and sending internationalized welcome emails
 * Loads translations server-side and passes them to the template
 */
export interface SendWelcomeEmailOptions {
	to: string;
	userName: string;
	dashboardUrl: string;
	locale?: string;
}

export async function sendWelcomeEmail({
	to,
	userName,
	dashboardUrl,
	locale = "en",
}: SendWelcomeEmailOptions): Promise<void> {
	try {
		// Import the translation utilities here to avoid client-side issues
		const { getLocaleTranslations, isLocaleSupported } = await import(
			"@/modules/i18n/utils"
		);

		// Determine the locale to use
		const validLocale = isLocaleSupported(locale) ? locale : "en";

		// Load translations for the email
		const t = await getLocaleTranslations(validLocale, "Email.welcome");

		// Prepare translations object
		const translations = {
			subject: t("subject", { appName: env.APP_NAME }),
			title: t("title", { appName: env.APP_NAME }),
			greeting: t("greeting", { userName }),
			congratulations: t("congratulations", { appName: env.APP_NAME }),
			getStarted: t("getStarted"),
			nextSteps: t("nextSteps"),
			step1: t("step1"),
			step2: t("step2"),
			step3: t("step3"),
			step4: t("step4"),
			features: t("features", { appName: env.APP_NAME }),
			feature1Title: t("feature1Title"),
			feature1Description: t("feature1Description"),
			feature2Title: t("feature2Title"),
			feature2Description: t("feature2Description"),
			feature3Title: t("feature3Title"),
			feature3Description: t("feature3Description"),
			feature4Title: t("feature4Title"),
			feature4Description: t("feature4Description"),
			support: t("support"),
			accountDetails: t("accountDetails"),
			accountCreated: t("accountCreated"),
			footer: t("footer", { appName: env.APP_NAME }),
			copyright: t("copyright", {
				year: new Date().getFullYear(),
				appName: env.APP_NAME,
			}),
		};

		// Render the email template to HTML
		const emailHtml = await render(
			WelcomeEmail({
				userEmail: to,
				userName,
				dashboardUrl,
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
			`✅ Welcome email sent successfully to ${to} in ${validLocale}`,
		);
	} catch (error) {
		console.error("❌ Failed to send welcome email:", error);
		throw new Error("Failed to send welcome email");
	}
}
