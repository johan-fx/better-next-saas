import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Img,
  Text,
  Button,
  Hr,
  Link,
} from "@react-email/components";

interface InvitationEmailProps {
  organizationName: string;
  inviterName: string;
  inviterEmail: string;
  role: string;
  inviteLink: string;
  appName?: string;
  logoUrl?: string;
}

/**
 * Invitation Email Template
 *
 * Used for organization invitations
 */
export function InvitationEmail({
  organizationName,
  inviterName,
  inviterEmail,
  role,
  inviteLink,
  appName = "Deck Pilot",
  logoUrl,
}: InvitationEmailProps) {
  const previewText = `You've been invited to join ${organizationName} on ${appName}`;

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
            <Text style={heading}>
              You&apos;re Invited to Join {organizationName}!
            </Text>
            <Text style={paragraph}>Hi there,</Text>
            <Text style={paragraph}>
              <strong>{inviterName}</strong> ({inviterEmail}) has invited you to
              join <strong>{organizationName}</strong> as a{" "}
              <strong>{role}</strong> on {appName}.
            </Text>
            <Section style={buttonContainer}>
              <Button href={inviteLink} style={button}>
                Accept Invitation
              </Button>
            </Section>
            <Text style={paragraph}>
              If the button above doesn&apos;t work, copy and paste this link
              into your browser:
            </Text>
            <Text style={linkText}>
              <Link href={inviteLink} style={link}>
                {inviteLink}
              </Link>
            </Text>
            <Hr style={hr} />
            <Text style={footerText}>
              If you did not expect this invitation, you can safely ignore this
              email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles (reuse from other templates for consistency)
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
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1f2937",
  textAlign: "center" as const,
  margin: "0 0 24px",
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
const footerText = {
  fontSize: "12px",
  lineHeight: "1.5",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "0 0 8px",
};

export default InvitationEmail;
