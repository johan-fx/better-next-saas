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

interface InvitationEmailProps {
	organizationName: string;
	inviterName: string;
	inviterEmail: string;
	role: string;
	inviteLink: string;
	appName?: string;
	logoUrl?: string;
	/**
	 * User's preferred locale
	 */
	locale?: string;
	/**
	 * Pre-translated text content
	 * This object contains all the translated strings for the email
	 */
	translations?: typeof enMessages.email.invitation;
}

// Translation mapping - now sourced from message files
const availableTranslations = {
	en: enMessages.email.invitation,
	es: esMessages.email.invitation,
};

/**
 * Internationalized Invitation Email Template (Props-based)
 *
 * Beautiful invitation email for organization invitations
 * Supports multiple languages through pre-translated props
 * This approach allows the email to work with react-email dev server
 * since all translations are passed as props from the server-side code
 */
export function InvitationEmail({
	organizationName,
	inviterName,
	inviterEmail,
	role,
	inviteLink,
	appName = "My App",
	logoUrl,
	locale = "en",
	translations: overrideTranslations,
}: InvitationEmailProps) {
	const currentYear = new Date().getFullYear();
	const translations =
		overrideTranslations ||
		availableTranslations[locale as keyof typeof availableTranslations];

	// Variables for string interpolation
	const variables = createEmailVariables({
		appName,
		organizationName,
		inviterName,
		inviterEmail,
		role,
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
							<Text className="text-2xl font-bold text-gray-800 text-center m-0 mb-6 leading-tight">
								{replaceVariables(translations.title, variables)}
							</Text>
							<Text className="text-base leading-relaxed text-gray-600 m-0 mb-4">
								{translations.greeting}
							</Text>
							<Text className="text-base leading-relaxed text-gray-600 m-0 mb-4">
								{replaceVariables(translations.invitedBy, variables)}
							</Text>
							<Section className="text-center my-8">
								<Button
									href={inviteLink}
									className="bg-primary hover:bg-primary-600 text-white font-semibold py-4 px-8 rounded-lg shadow-lg inline-block no-underline transition-all duration-200"
								>
									{translations.acceptInvitation}
								</Button>
							</Section>
							<Text className="text-base leading-relaxed text-gray-600 m-0 mb-4">
								{translations.alternativeLink}
							</Text>
							<Text className="text-sm leading-relaxed text-gray-500 m-0 mb-6 break-all">
								<Link href={inviteLink} className="text-primary underline">
									{inviteLink}
								</Link>
							</Text>
							<Hr className="border-gray-200 my-6" />
							<Text className="text-xs leading-normal text-gray-400 text-center m-0 mb-2">
								{translations.footer}
							</Text>
						</Section>
					</Container>
				</Body>
			</Html>
		</Tailwind>
	);
}

export default InvitationEmail;
