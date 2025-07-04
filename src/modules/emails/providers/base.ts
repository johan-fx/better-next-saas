/**
 * Base email provider interface and types
 *
 * This file defines the contract that all email providers must implement
 * allowing for easy switching between different email services
 */

/**
 * Email sending options
 */
export interface SendEmailOptions {
	to: string;
	subject: string;
	html: string;
	text?: string;
}

/**
 * Email provider interface
 *
 * All email providers must implement this interface
 * This allows easy switching between different email services
 */
export interface EmailProvider {
	sendEmail(options: SendEmailOptions): Promise<void>;
}

/**
 * Email provider configuration
 */
export interface EmailProviderConfig {
	name: string;
	description: string;
	requiresConfig?: boolean;
}
