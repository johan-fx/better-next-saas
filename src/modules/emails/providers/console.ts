import type { EmailProvider, SendEmailOptions } from "./base";

/**
 * Console Email Provider (Development)
 *
 * Logs emails to console for development and testing
 * Perfect for local development where you don't want to send real emails
 */
export class ConsoleEmailProvider implements EmailProvider {
	async sendEmail(options: SendEmailOptions): Promise<void> {
		console.log("\n📧 EMAIL SENT (Console Provider)");
		console.log("=====================================");
		console.log(`To: ${options.to}`);
		console.log(`Subject: ${options.subject}`);
		console.log("HTML Content:");
		console.log(`${options.html.substring(0, 200)}...`);
		if (options.text) {
			console.log("Text Content:");
			console.log(`${options.text.substring(0, 200)}...`);
		}
		console.log("=====================================\n");
	}
}
