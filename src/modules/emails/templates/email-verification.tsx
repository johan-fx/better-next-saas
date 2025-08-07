import {
	Body,
	Button,
	Column,
	Container,
	Head,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	Row,
	Section,
	Tailwind,
	Text,
} from "@react-email/components";
// biome-ignore lint/correctness/noUnusedImports: This import is required for the email template to work
import * as React from "react";

import enMessages from "@/messages/en.json";
import esMessages from "@/messages/es.json";
import { TAILWIND_CONFIG } from "../config";
import { createEmailVariables, replaceVariables } from "../utils/variables";

interface EmailVerificationProps {
	/**
	 * User's name to personalize the email
	 */
	userName?: string;
	/**
	 * User's email address
	 */
	userEmail: string;
	/**
	 * Verification URL with token
	 */
	verificationUrl: string;
	/**
	 * Application name
	 */
	appName?: string;
	/**
	 * Company/app logo URL
	 */
	logoUrl?: string;
	/**
	 * Expiration time in hours
	 */
	expirationHours?: number;
	/**
	 * User's preferred locale
	 */
	locale?: string;
	/**
	 * Pre-translated text content
	 * This object contains all the translated strings for the email
	 */
	translations?: typeof enMessages.email.verification;
}

// Translation mapping - now sourced from message files
const availableTranslations = {
	en: enMessages.email.verification,
	es: esMessages.email.verification,
};

/**
 * Internationalized Email Verification Template (Props-based)
 *
 * Beautiful, responsive email template for email verification
 * Supports multiple languages through pre-translated props
 * This approach allows the email to work with react-email dev server
 * since all translations are passed as props from the server-side code
 */
export function EmailVerification({
	userName = "there",
	userEmail,
	verificationUrl,
	appName = "My App",
	logoUrl,
	expirationHours = 24,
	locale = "es",
	translations: overrideTranslations,
}: EmailVerificationProps) {
	const currentYear = new Date().getFullYear();
	const translations =
		overrideTranslations ||
		availableTranslations[locale as keyof typeof availableTranslations];

	// Variables for string interpolation
	const variables = createEmailVariables({
		appName,
		userName,
		userEmail,
		expirationHours,
		year: currentYear,
	});

	const previewText = replaceVariables(translations.subject, variables);

	return (
		<Tailwind config={TAILWIND_CONFIG}>
			<Html>
				<Head />
				<Preview>{previewText}</Preview>

				<Body className="bg-gray-50 font-sans">
					<Container className="bg-white mx-auto py-5 mb-16 max-w-xl">
						{/* Header with Logo */}
						<Section className="px-6 py-8 text-center">
							<Row>
								<Column>
									{logoUrl ? (
										<Img
											src={logoUrl}
											width="48"
											height="48"
											alt={`${appName} Logo`}
											className="mx-auto rounded-lg"
										/>
									) : (
										<Text className="text-2xl font-bold text-gray-800 m-0 text-center">
											{appName}
										</Text>
									)}
								</Column>
							</Row>
						</Section>

						{/* Main Content */}
						<Section className="px-6">
							{/* Welcome Message */}
							<Text className="text-3xl font-bold text-gray-800 text-center m-0 mb-8 leading-tight">
								{translations.title}
							</Text>

							<Text className="text-base leading-relaxed text-gray-600 m-0 mb-4">
								{replaceVariables(translations.greeting, variables)}
							</Text>

							<Text className="text-base leading-relaxed text-gray-600 m-0 mb-4">
								{replaceVariables(translations.description, variables)}
							</Text>

							{/* Verification Button */}
							<Section className="text-center my-8">
								<Button
									href={verificationUrl}
									className="bg-primary hover:bg-primary-600 text-white font-semibold py-4 px-8 rounded-lg shadow-lg inline-block no-underline transition-all duration-200"
								>
									{translations.verifyButton}
								</Button>
							</Section>

							{/* Alternative Link */}
							<Text className="text-base leading-relaxed text-gray-600 m-0 mb-4">
								{translations.alternativeLink}
							</Text>

							<Text className="text-sm leading-relaxed text-gray-500 m-0 mb-6 break-all">
								<Link href={verificationUrl} className="text-primary underline">
									{verificationUrl}
								</Link>
							</Text>

							{/* Security Notice */}
							<Hr className="border-gray-200 my-6" />

							<Text className="text-sm leading-relaxed text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-200 my-6">
								<strong>
									{replaceVariables(translations.linkExpiry, variables)}
								</strong>
							</Text>

							<Text className="text-base leading-relaxed text-gray-600 m-0 mb-4">
								{replaceVariables(translations.noAccount, variables)}
							</Text>

							{/* Account Info */}
							<Section className="bg-gray-50 p-4 rounded-lg my-6">
								<Text className="text-sm leading-normal text-gray-500 m-0 mb-2">
									<strong>{translations.accountDetails}</strong>
								</Text>
								<Text className="text-sm leading-normal text-gray-500 m-0 mb-2">
									Email: {userEmail}
								</Text>
								<Text className="text-sm leading-normal text-gray-500 m-0 mb-2">
									{translations.verificationRequested}{" "}
									{new Date().toLocaleString(locale)}
								</Text>
							</Section>
						</Section>

						{/* Footer */}
						<Section className="px-6">
							<Hr className="border-gray-200 my-6" />

							<Text className="text-xs leading-normal text-gray-400 text-center m-0 mb-2">
								{replaceVariables(translations.footer, variables)}
							</Text>

							<Text className="text-xs leading-normal text-gray-400 text-center m-0 mb-2">
								{replaceVariables(translations.copyright, variables)}
							</Text>
						</Section>
					</Container>
				</Body>
			</Html>
		</Tailwind>
	);
}

export default EmailVerification;
