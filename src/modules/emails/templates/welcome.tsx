import {
	Body,
	Button,
	Column,
	Container,
	Head,
	Hr,
	Html,
	Img,
	Preview,
	Row,
	Section,
	Text,
} from "@react-email/components";
// biome-ignore lint/correctness/noUnusedImports: This import is required for the email template to work
import * as React from "react";

import enMessages from "@/messages/en.json";
import esMessages from "@/messages/es.json";

interface WelcomeEmailProps {
	/**
	 * User's name
	 */
	userName: string;
	/**
	 * User's email address
	 */
	userEmail: string;
	/**
	 * Dashboard/app URL
	 */
	dashboardUrl: string;
	/**
	 * User's preferred locale
	 */
	locale?: string;
	/**
	 * Application name
	 */
	appName?: string;
	/**
	 * Company/app logo URL
	 */
	logoUrl?: string;
	/**
	 * Pre-translated text content
	 * This object contains all the translated strings for the email
	 */
	translations?: typeof enMessages.Email.welcome;
}

// Translation mapping - now sourced from message files
const availableTranslations = {
	en: enMessages.Email.welcome,
	es: esMessages.Email.welcome,
};

/**
 * Internationalized Welcome Email Template (Props-based)
 *
 * Beautiful welcome email sent after successful email verification
 * Supports multiple languages through pre-translated props
 * This approach allows the email to work with react-email dev server
 * since all translations are passed as props from the server-side code
 */
export default function WelcomeEmail({
	userEmail,
	dashboardUrl,
	locale = "en",
	appName = "Deck Pilot",
	logoUrl,
	translations: overrideTranslations,
}: WelcomeEmailProps) {
	const currentYear = new Date().getFullYear();
	const translations =
		overrideTranslations ||
		availableTranslations[locale as keyof typeof availableTranslations];

	return (
		<Html>
			<Head />
			<Preview>{translations.subject}</Preview>

			<Body style={main}>
				<Container style={container}>
					{/* Header with Logo */}
					<Section style={header}>
						<Row>
							<Column>
								{logoUrl ? (
									<Img
										src={logoUrl}
										width="48"
										height="48"
										alt={`${appName} Logo`}
										style={logo}
									/>
								) : (
									<Text style={logoText}>{appName}</Text>
								)}
							</Column>
						</Row>
					</Section>

					{/* Main Content */}
					<Section style={content}>
						{/* Welcome Message */}
						<Text style={heading}>{translations.title}</Text>

						<Text style={paragraph}>{translations.greeting}</Text>

						<Text style={paragraph}>{translations.congratulations}</Text>

						{/* Get Started Button */}
						<Section style={buttonContainer}>
							<Button href={dashboardUrl} style={button}>
								{translations.getStarted}
							</Button>
						</Section>

						{/* Next Steps */}
						<Section style={stepsSection}>
							<Text style={stepsHeading}>{translations.nextSteps}</Text>

							<div style={stepsList}>
								<Text style={stepItem}>
									<strong>1.</strong> {translations.step1}
								</Text>
								<Text style={stepItem}>
									<strong>2.</strong> {translations.step2}
								</Text>
								<Text style={stepItem}>
									<strong>3.</strong> {translations.step3}
								</Text>
								<Text style={stepItem}>
									<strong>4.</strong> {translations.step4}
								</Text>
							</div>
						</Section>

						{/* Features Highlight */}
						<Hr style={hr} />

						<Section style={featuresSection}>
							<Text style={featuresHeading}>{translations.features}</Text>

							<Row>
								<Column style={featureColumn}>
									<Text style={featureTitle}>{translations.feature1Title}</Text>
									<Text style={featureDescription}>
										{translations.feature1Description}
									</Text>
								</Column>
								<Column style={featureColumn}>
									<Text style={featureTitle}>{translations.feature2Title}</Text>
									<Text style={featureDescription}>
										{translations.feature2Description}
									</Text>
								</Column>
							</Row>

							<Row>
								<Column style={featureColumn}>
									<Text style={featureTitle}>{translations.feature3Title}</Text>
									<Text style={featureDescription}>
										{translations.feature3Description}
									</Text>
								</Column>
								<Column style={featureColumn}>
									<Text style={featureTitle}>{translations.feature4Title}</Text>
									<Text style={featureDescription}>
										{translations.feature4Description}
									</Text>
								</Column>
							</Row>
						</Section>

						{/* Support Information */}
						<Hr style={hr} />

						<Text style={supportText}>{translations.support}</Text>

						{/* Account Info */}
						<Section style={accountInfo}>
							<Text style={accountInfoText}>
								<strong>{translations.accountDetails}</strong>
							</Text>
							<Text style={accountInfoText}>Email: {userEmail}</Text>
							<Text style={accountInfoText}>
								{translations.accountCreated}{" "}
								{new Date().toLocaleString(locale)}
							</Text>
						</Section>
					</Section>

					{/* Footer */}
					<Section style={footer}>
						<Hr style={hr} />

						<Text style={footerText}>{translations.footer}</Text>

						<Text style={footerText}>
							{translations.copyright.replace("{year}", currentYear.toString())}
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

// Styles (same as original welcome email)
const main = {
	backgroundColor: "#ffffff",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
	margin: "0 auto",
	padding: "20px 0 48px",
	maxWidth: "580px",
};

const header = {
	padding: "32px 0",
};

const logo = {
	margin: "0 auto",
	borderRadius: "8px",
};

const logoText = {
	fontSize: "24px",
	fontWeight: "bold",
	textAlign: "center" as const,
	color: "#333333",
	margin: "0",
};

const content = {
	padding: "0 20px",
};

const heading = {
	fontSize: "28px",
	lineHeight: "1.3",
	fontWeight: "bold",
	color: "#333333",
	textAlign: "center" as const,
	margin: "0 0 24px",
};

const paragraph = {
	fontSize: "16px",
	lineHeight: "26px",
	color: "#555555",
	margin: "0 0 16px",
};

const buttonContainer = {
	textAlign: "center" as const,
	margin: "32px 0",
};

const button = {
	backgroundColor: "#007ee6",
	borderRadius: "6px",
	color: "#fff",
	fontSize: "16px",
	fontWeight: "bold",
	textDecoration: "none",
	textAlign: "center" as const,
	display: "inline-block",
	padding: "12px 24px",
	margin: "0 auto",
};

const stepsSection = {
	margin: "32px 0",
	padding: "24px",
	backgroundColor: "#f8f9fa",
	borderRadius: "8px",
};

const stepsHeading = {
	fontSize: "18px",
	fontWeight: "bold",
	color: "#333333",
	margin: "0 0 16px",
};

const stepsList = {
	margin: "0",
};

const stepItem = {
	fontSize: "14px",
	lineHeight: "22px",
	color: "#555555",
	margin: "0 0 8px",
};

const hr = {
	borderColor: "#e6ebf1",
	margin: "32px 0",
};

const featuresSection = {
	margin: "32px 0",
};

const featuresHeading = {
	fontSize: "18px",
	fontWeight: "bold",
	color: "#333333",
	margin: "0 0 24px",
	textAlign: "center" as const,
};

const featureColumn = {
	width: "50%",
	padding: "0 12px",
	verticalAlign: "top" as const,
};

const featureTitle = {
	fontSize: "14px",
	fontWeight: "bold",
	color: "#333333",
	margin: "0 0 8px",
};

const featureDescription = {
	fontSize: "13px",
	lineHeight: "18px",
	color: "#666666",
	margin: "0 0 16px",
};

const supportText = {
	fontSize: "14px",
	lineHeight: "22px",
	color: "#555555",
	margin: "0 0 24px",
	textAlign: "center" as const,
};

const accountInfo = {
	margin: "24px 0",
	padding: "16px",
	backgroundColor: "#f8f9fa",
	borderRadius: "6px",
};

const accountInfoText = {
	fontSize: "14px",
	lineHeight: "20px",
	color: "#555555",
	margin: "0 0 4px",
};

const footer = {
	padding: "32px 20px 0",
	textAlign: "center" as const,
};

const footerText = {
	fontSize: "12px",
	lineHeight: "16px",
	color: "#8898aa",
	margin: "0 0 8px",
	textAlign: "center" as const,
};
