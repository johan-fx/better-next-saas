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

interface SubscriptionCancellationEmailProps {
	userName: string;
	userEmail: string;
	dashboardUrl: string;
	planName: string;
	effectiveDate: string;
	cancellationReason?: string;
	locale?: string;
	appName?: string;
	logoUrl?: string;
	translations?: typeof enMessages.email.subscriptionCancellation;
}

const availableTranslations = {
	en: enMessages.email.subscriptionCancellation,
	es: esMessages.email.subscriptionCancellation,
};

export default function SubscriptionCancellationEmail({
	userName,
	userEmail,
	dashboardUrl,
	planName,
	effectiveDate,
	cancellationReason,
	locale = "en",
	appName = "My App",
	logoUrl,
	translations: overrideTranslations,
}: SubscriptionCancellationEmailProps) {
	const currentYear = new Date().getFullYear();
	const translations =
		overrideTranslations ||
		availableTranslations[locale as keyof typeof availableTranslations];

	const variables = createEmailVariables({
		appName,
		userName,
		userEmail,
		planName,
		effectiveDate,
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
							{/* Title */}
							<Text className="text-3xl leading-tight font-bold text-gray-800 text-center m-0 mb-6">
								{replaceVariables(translations.title, variables)}
							</Text>

							<Text className="text-base leading-relaxed text-gray-600 m-0 mb-4">
								{replaceVariables(translations.greeting, variables)}
							</Text>

							<Text className="text-base leading-relaxed text-gray-600 m-0 mb-6">
								{replaceVariables(translations.cancellationMessage, variables)}
							</Text>

							{/* Cancellation Details */}
							<Section className="my-8 p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
								<Text className="text-lg font-bold text-gray-800 m-0 mb-4 text-center">
									{translations.details}
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
												{translations.effectiveDateLabel}:
											</Text>
										</Column>
										<Column className="w-1/2">
											<Text className="text-sm text-gray-600 m-0">
												{effectiveDate}
											</Text>
										</Column>
									</Row>

									{cancellationReason ? (
										<Row>
											<Column className="w-1/2">
												<Text className="text-sm font-semibold text-gray-700 m-0">
													{translations.cancellationReasonLabel}:
												</Text>
											</Column>
											<Column className="w-1/2">
												<Text className="text-sm text-gray-600 m-0">
													{cancellationReason}
												</Text>
											</Column>
										</Row>
									) : null}
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

							{/* Account Info */}
							<Section className="my-6 p-4 bg-gray-50 rounded-md">
								<Text className="text-sm leading-normal text-gray-600 m-0 mb-1">
									<strong>{translations.accountDetails}</strong>
								</Text>
								<Text className="text-sm leading-normal text-gray-600 m-0 mb-1">
									{translations.email}: {userEmail}
								</Text>
								<Text className="text-sm leading-normal text-gray-600 m-0 mb-1">
									{translations.cancellationRequested}{" "}
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
