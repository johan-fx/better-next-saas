/**
 * Email Module
 *
 * A well-organized email system with separated concerns:
 * - Providers: Handle email delivery (Console, SMTP, etc.)
 * - Services: Handle specific email types (verification, welcome, etc.)
 * - Config: Centralized email configuration
 * - Utils: Utility functions for email operations
 * - Templates: React Email templates (in templates/ directory)
 */

export type { EmailTemplateType } from "./config";
// Export configuration
export { EMAIL_CONFIG } from "./config";
// Export provider types
export type { EmailProvider, SendEmailOptions } from "./providers";
// Export email providers for advanced usage
export {
	ConsoleEmailProvider,
	createEmailProvider,
	getEmailProvider,
	SmtpEmailProvider,
} from "./providers";
// Export service types
export type {
	SendInvitationEmailOptions,
	SendPasswordResetEmailOptions,
	SendVerificationEmailOptions,
	SendWelcomeEmailOptions,
} from "./services";
// Export all email services (main API)
export {
	sendInvitationEmail,
	sendPasswordResetEmail,
	sendVerificationEmail,
	sendWelcomeEmail,
} from "./services";
// Re-export templates for direct access if needed
export { default as EmailVerificationTemplate } from "./templates/email-verification";
export { default as InvitationEmailTemplate } from "./templates/invitation";
export { default as WelcomeEmailTemplate } from "./templates/welcome";
// Export utilities
export {
	getEmailDomain,
	isValidEmail,
	maskEmail,
	renderEmailTemplate,
	sendTestEmail,
} from "./utils";
