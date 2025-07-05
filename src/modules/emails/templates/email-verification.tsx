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
	Text,
} from "@react-email/components";
// biome-ignore lint/correctness/noUnusedImports: This import is required for the email template to work
import * as React from "react";

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
}

/**
 * Email Verification Template
 *
 * Beautiful, responsive email template for email verification
 * Built with React Email components for maximum compatibility
 */
export function EmailVerification({
	userName = "there",
	userEmail,
	verificationUrl,
	appName = "Deck Pilot",
	logoUrl,
	expirationHours = 24,
}: EmailVerificationProps) {
	const previewText = `Verify your email address for ${appName}`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>

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
						<Text style={heading}>Verify your email address</Text>

						<Text style={paragraph}>Hi {userName},</Text>

						<Text style={paragraph}>
							Thanks for signing up for {appName}! To complete your registration
							and start using your account, please verify your email address by
							clicking the button below.
						</Text>

						{/* Verification Button */}
						<Section style={buttonContainer}>
							<Button href={verificationUrl} style={button}>
								Verify Email Address
							</Button>
						</Section>

						{/* Alternative Link */}
						<Text style={paragraph}>
							If the button above doesn&apos;t work, you can also copy and paste
							this link into your browser:
						</Text>

						<Text style={linkText}>
							<Link href={verificationUrl} style={link}>
								{verificationUrl}
							</Link>
						</Text>

						{/* Security Notice */}
						<Hr style={hr} />

						<Text style={securityNotice}>
							<strong>Security Notice:</strong> This verification link will
							expire in {expirationHours} hours and can only be used once. If
							you didn&apos;t create an account with {appName}, you can safely
							ignore this email.
						</Text>

						{/* Account Info */}
						<Section style={accountInfo}>
							<Text style={accountInfoText}>
								<strong>Account Details:</strong>
							</Text>
							<Text style={accountInfoText}>Email: {userEmail}</Text>
							<Text style={accountInfoText}>
								Verification requested: {new Date().toLocaleString()}
							</Text>
						</Section>
					</Section>

					{/* Footer */}
					<Section style={footer}>
						<Hr style={hr} />

						<Text style={footerText}>
							This email was sent to {userEmail} because you created an account
							on {appName}. If you have any questions, please contact our
							support team.
						</Text>

						<Text style={footerText}>
							© {new Date().getFullYear()} {appName}. All rights reserved.
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

// Styles - Mobile-first responsive design
const main = {
	backgroundColor: "#f6f9fc",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
	backgroundColor: "#ffffff",
	margin: "0 auto",
	padding: "20px 0 48px",
	marginBottom: "64px",
	maxWidth: "580px",
};

const header = {
	padding: "32px 24px 24px",
	textAlign: "center" as const,
};

const logo = {
	margin: "0 auto",
	borderRadius: "8px",
};

const logoText = {
	fontSize: "24px",
	fontWeight: "bold",
	color: "#1f2937",
	margin: "0",
	textAlign: "center" as const,
};

const content = {
	padding: "0 24px",
};

const heading = {
	fontSize: "28px",
	fontWeight: "bold",
	color: "#1f2937",
	textAlign: "center" as const,
	margin: "0 0 32px",
	lineHeight: "1.3",
};

const paragraph = {
	fontSize: "16px",
	lineHeight: "1.6",
	color: "#374151",
	margin: "0 0 16px",
};

const buttonContainer = {
	textAlign: "center" as const,
	margin: "32px 0",
};

const button = {
	backgroundColor: "#3b82f6",
	borderRadius: "8px",
	color: "#ffffff",
	fontSize: "16px",
	fontWeight: "600",
	textDecoration: "none",
	textAlign: "center" as const,
	display: "inline-block",
	padding: "16px 32px",
	boxShadow:
		"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
	transition: "all 0.2s ease-in-out",
};

const linkText = {
	fontSize: "14px",
	lineHeight: "1.6",
	color: "#6b7280",
	margin: "0 0 24px",
	wordBreak: "break-all" as const,
};

const link = {
	color: "#3b82f6",
	textDecoration: "underline",
};

const hr = {
	borderColor: "#e5e7eb",
	margin: "24px 0",
};

const securityNotice = {
	fontSize: "14px",
	lineHeight: "1.6",
	color: "#f59e0b",
	backgroundColor: "#fef3c7",
	padding: "16px",
	borderRadius: "8px",
	border: "1px solid #f3e8ff",
	margin: "24px 0",
};

const accountInfo = {
	backgroundColor: "#f9fafb",
	padding: "16px",
	borderRadius: "8px",
	margin: "24px 0",
};

const accountInfoText = {
	fontSize: "14px",
	lineHeight: "1.5",
	color: "#6b7280",
	margin: "0 0 8px",
};

const footer = {
	padding: "24px",
};

const footerText = {
	fontSize: "12px",
	lineHeight: "1.5",
	color: "#9ca3af",
	textAlign: "center" as const,
	margin: "0 0 8px",
};

export default EmailVerification;
