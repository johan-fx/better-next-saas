import nodemailer from "nodemailer";
import { env } from "@/lib/env";
import type { EmailProvider, SendEmailOptions } from "./base";

/**
 * SMTP Email Provider (Production)
 *
 * Uses nodemailer to send emails via SMTP. Reads credentials from environment variables.
 * Required env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */
export class SmtpEmailProvider implements EmailProvider {
	private transporter: nodemailer.Transporter;
	private from: string;

	constructor() {
		// Validate required SMTP configuration
		if (
			!env.SMTP_HOST ||
			!env.SMTP_PORT ||
			!env.SMTP_USER ||
			!env.SMTP_PASS ||
			!env.SMTP_FROM
		) {
			throw new Error(
				"Missing required SMTP configuration. Please check your environment variables.",
			);
		}

		// Read SMTP config from environment variables
		const host = env.SMTP_HOST;
		const port = Number(env.SMTP_PORT);
		const user = env.SMTP_USER;
		const pass = env.SMTP_PASS;
		this.from = env.SMTP_FROM;

		// Create the nodemailer transporter
		this.transporter = nodemailer.createTransport({
			host,
			port,
			secure: port === 465, // true for 465, false for other ports
			auth: { user, pass },
		});
	}

	async sendEmail(options: SendEmailOptions): Promise<void> {
		try {
			await this.transporter.sendMail({
				from: this.from,
				to: options.to,
				subject: options.subject,
				html: options.html,
				text: options.text,
			});

			console.log(`✅ SMTP email sent successfully to ${options.to}`);
		} catch (error) {
			console.error("❌ SMTP email failed:", error);
			throw new Error(
				`Failed to send email via SMTP: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}
}
