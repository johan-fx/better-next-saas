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
	Tailwind,
	Text,
} from "@react-email/components";
// biome-ignore lint/correctness/noUnusedImports: This import is required for the email template to work
import * as React from "react";

import enMessages from "@/messages/en.json";
import esMessages from "@/messages/es.json";
import { TAILWIND_CONFIG } from "../config";
import { createEmailVariables, replaceVariables } from "../utils/variables";

interface SubscriptionNotificationEmailProps {
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
	 * Subscription plan name
	 */
	planName: string;
	/**
	 * Subscription price (formatted)
	 */
	planPrice: string;
	/**
	 * Billing cycle (monthly, yearly, etc.)
	 */
	billingCycle: string;
	/**
	 * Next billing date (formatted)
	 */
	nextBillingDate: string;
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
	translations?: typeof enMessages.email.subscription;
}

// Translation mapping - now sourced from message files
const availableTranslations = {
	en: enMessages.email.subscription,
	es: esMessages.email.subscription,
};

/**
 * Internationalized Subscription Notification Email Template (Props-based)
 *
 * Beautiful subscription notification email sent after successful subscription creation
 * Supports multiple languages through pre-translated props
 * This approach allows the email to work with react-email dev server
 * since all translations are passed as props from the server-side code
 */
export default function SubscriptionNotificationEmail({
	userName,
	userEmail,
	dashboardUrl,
	planName,
	planPrice,
	billingCycle,
	nextBillingDate,
	locale = "en",
	appName = "My App",
	logoUrl,
	translations: overrideTranslations,
}: SubscriptionNotificationEmailProps) {
	const currentYear = new Date().getFullYear();
	const translations =
		overrideTranslations ||
		availableTranslations[locale as keyof typeof availableTranslations];

	// Variables for string interpolation
	const variables = createEmailVariables({
		appName,
		userName,
		userEmail,
		planName,
		planPrice,
		billingCycle,
		nextBillingDate,
		year: currentYear,
	});

	return (
		<Tailwind config={TAILWIND_CONFIG}>
			<Html>
				<Head />
				<Preview>{replaceVariables(translations.subject, variables)}</Preview>

				<Body className="bg-white font-sans">
					<Container className="mx-auto py-5 max-w-xl">
						{/* Header with Logo */}
						<Section className="py-8">
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
										<Text className="text-2xl font-bold text-center text-gray-800 m-0">
											{appName}
										</Text>
									)}
								</Column>
							</Row>
						</Section>

						{/* Main Content */}
						<Section className="px-5">
							{/* Subscription Confirmation Message */}
							<Text className="text-3xl leading-tight font-bold text-gray-800 text-center m-0 mb-6">
								{replaceVariables(translations.title, variables)}
							</Text>

							<Text className="text-base leading-relaxed text-gray-600 m-0 mb-4">
								{replaceVariables(translations.greeting, variables)}
							</Text>

							<Text className="text-base leading-relaxed text-gray-600 m-0 mb-6">
								{replaceVariables(translations.confirmation, variables)}
							</Text>

							{/* Subscription Details Card */}
							<Section className="my-8 p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
								<Text className="text-lg font-bold text-gray-800 m-0 mb-4 text-center">
									{translations.subscriptionDetails}
								</Text>

								<div className="space-y-3">
									<Row>
										<Column className="w-1/2">
											<Text className="text-sm font-semibold text-gray-700 m-0">
												{translations.plan}:
											</Text>
										</Column>
										<Column className="w-1/2">
											<Text className="text-sm text-gray-600 m-0">
												{planName}
											</Text>
										</Column>
									</Row>

									<Row>
										<Column className="w-1/2">
											<Text className="text-sm font-semibold text-gray-700 m-0">
												{translations.price}:
											</Text>
										</Column>
										<Column className="w-1/2">
											<Text className="text-sm text-gray-600 m-0">
												{planPrice} / {billingCycle}
											</Text>
										</Column>
									</Row>

									<Row>
										<Column className="w-1/2">
											<Text className="text-sm font-semibold text-gray-700 m-0">
												{translations.nextBilling}:
											</Text>
										</Column>
										<Column className="w-1/2">
											<Text className="text-sm text-gray-600 m-0">
												{nextBillingDate}
											</Text>
										</Column>
									</Row>
								</div>
							</Section>

							{/* Access Dashboard Button */}
							<Section className="text-center my-8">
								<Button
									href={dashboardUrl}
									className="bg-primary hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-md inline-block no-underline text-center mx-auto"
								>
									{translations.accessDashboard}
								</Button>
							</Section>

							{/* What's Next Section */}
							<Section className="my-8 p-6 bg-gray-50 rounded-lg">
								<Text className="text-lg font-bold text-gray-800 m-0 mb-4">
									{translations.whatsNext}
								</Text>

								<div className="m-0">
									<Text className="text-sm leading-relaxed text-gray-600 m-0 mb-2">
										<strong>1.</strong> {translations.step1}
									</Text>
									<Text className="text-sm leading-relaxed text-gray-600 m-0 mb-2">
										<strong>2.</strong> {translations.step2}
									</Text>
									<Text className="text-sm leading-relaxed text-gray-600 m-0 mb-2">
										<strong>3.</strong> {translations.step3}
									</Text>
									<Text className="text-sm leading-relaxed text-gray-600 m-0 mb-2">
										<strong>4.</strong> {translations.step4}
									</Text>
								</div>
							</Section>

							{/* Premium Features Highlight */}
							<Hr className="border-gray-200 my-8" />

							<Section className="my-8">
								<Text className="text-lg font-bold text-gray-800 m-0 mb-6 text-center">
									{translations.premiumFeatures}
								</Text>

								<Row>
									<Column className="w-1/2 px-3 align-top">
										<Text className="text-sm font-bold text-gray-800 m-0 mb-2">
											{translations.feature1Title}
										</Text>
										<Text className="text-xs leading-relaxed text-gray-600 m-0 mb-4">
											{translations.feature1Description}
										</Text>
									</Column>
									<Column className="w-1/2 px-3 align-top">
										<Text className="text-sm font-bold text-gray-800 m-0 mb-2">
											{translations.feature2Title}
										</Text>
										<Text className="text-xs leading-relaxed text-gray-600 m-0 mb-4">
											{translations.feature2Description}
										</Text>
									</Column>
								</Row>

								<Row>
									<Column className="w-1/2 px-3 align-top">
										<Text className="text-sm font-bold text-gray-800 m-0 mb-2">
											{translations.feature3Title}
										</Text>
										<Text className="text-xs leading-relaxed text-gray-600 m-0 mb-4">
											{translations.feature3Description}
										</Text>
									</Column>
									<Column className="w-1/2 px-3 align-top">
										<Text className="text-sm font-bold text-gray-800 m-0 mb-2">
											{translations.feature4Title}
										</Text>
										<Text className="text-xs leading-relaxed text-gray-600 m-0 mb-4">
											{translations.feature4Description}
										</Text>
									</Column>
								</Row>
							</Section>

							{/* Billing Information */}
							<Hr className="border-gray-200 my-8" />

							<Text className="text-sm leading-relaxed text-gray-600 m-0 mb-6 text-center">
								{translations.billingInfo}
							</Text>

							{/* Account Info */}
							<Section className="my-6 p-4 bg-gray-50 rounded-md">
								<Text className="text-sm leading-normal text-gray-600 m-0 mb-1">
									<strong>{translations.accountDetails}</strong>
								</Text>
								<Text className="text-sm leading-normal text-gray-600 m-0 mb-1">
									{translations.email}: {userEmail}
								</Text>
								<Text className="text-sm leading-normal text-gray-600 m-0 mb-1">
									{translations.subscriptionDate}{" "}
									{new Date().toLocaleString(locale)}
								</Text>
							</Section>
						</Section>

						{/* Footer */}
						<Section className="py-8 px-5 text-center">
							<Hr className="border-gray-200 my-8" />

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
