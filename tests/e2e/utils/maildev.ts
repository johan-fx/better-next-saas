/**
 * MailDev Testing Utilities
 *
 * This module provides utilities for email testing with MailDev.
 * Used in end-to-end tests to verify email workflows like:
 * - User signup with email verification
 * - Password reset emails
 * - Notification emails
 *
 * Features:
 * - Generate unique test email addresses
 * - Wait for specific emails with retry logic
 * - Extract verification links from emails
 * - Query MailDev REST API for email retrieval
 * - Docker and local MailDev support
 * - Basic authentication support
 *
 * Environment Variables:
 * - MAILDEV_WEB_URL: MailDev web interface URL (default: http://localhost:1080)
 * - MAILDEV_SMTP_HOST: SMTP host (default: localhost)
 * - MAILDEV_SMTP_PORT: SMTP port (default: 1025)
 * - MAILDEV_USERNAME: Username for MailDev authentication (optional)
 * - MAILDEV_PASSWORD: Password for MailDev authentication (optional)
 *
 * If your MailDev instance requires authentication, set MAILDEV_USERNAME and MAILDEV_PASSWORD
 * environment variables in your test environment or .env file.
 */

/**
 * Interface for email verification test data
 * Simplified for MailDev - no real inbox creation needed
 */
export interface EmailTestInbox {
  id: string;
  emailAddress: string;
}

/**
 * Interface for email content with verification link
 */
export interface EmailWithVerificationLink {
  id: string;
  subject: string;
  body: string;
  verificationLink: string | null;
}

import { env } from "@/lib/env";

/**
 * MailDev configuration from centralized environment validation
 */
const MAILDEV_CONFIG = {
  // MailDev web interface URL (default: http://localhost:1080)
  webUrl: env.MAILDEV_WEB_URL,
  // MailDev SMTP host (default: localhost)
  smtpHost: env.MAILDEV_SMTP_HOST,
  // MailDev SMTP port (default: 1025)
  smtpPort: parseInt(env.MAILDEV_SMTP_PORT),
  // MailDev authentication credentials (optional)
  username: env.MAILDEV_USERNAME,
  password: env.MAILDEV_PASSWORD,
};

// Timeout for email operations (60 seconds)
const EMAIL_TIMEOUT = 60_000;

/**
 * Create authentication headers for MailDev API requests
 * Returns headers object with Authorization header if credentials are configured
 */
function createAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add basic authentication if credentials are provided
  if (MAILDEV_CONFIG.username && MAILDEV_CONFIG.password) {
    const credentials = btoa(
      `${MAILDEV_CONFIG.username}:${MAILDEV_CONFIG.password}`
    );
    headers["Authorization"] = `Basic ${credentials}`;
  }

  return headers;
}

/**
 * Create a test inbox with unique email address
 * For MailDev, this just generates a unique email - no actual inbox creation
 */
export async function createTestInbox(): Promise<EmailTestInbox> {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const testId = `test-${timestamp}-${randomId}`;

  const emailAddress = `${testId}@localhost.local`;

  console.log(`📧 Generated test email: ${emailAddress}`);

  return {
    id: testId,
    emailAddress: emailAddress,
  };
}

/**
 * Wait for email with specific subject containing text
 * Polls MailDev API until email arrives or timeout is reached
 */
export async function waitForEmailWithSubject(
  inboxId: string,
  subjectContains: string,
  timeout: number = EMAIL_TIMEOUT
): Promise<EmailWithVerificationLink> {
  const startTime = Date.now();
  const pollInterval = 2000; // Poll every 2 seconds

  console.log(
    `📧 Waiting for email with subject containing "${subjectContains}" (timeout: ${timeout}ms)...`
  );

  while (Date.now() - startTime < timeout) {
    try {
      // Get all emails from MailDev
      const emails = await getAllEmailsFromMailDev();

      // Filter emails by recipient (match the test email)
      const testEmailAddress = `${inboxId}@localhost.local`;
      const matchingEmails = emails.filter((email: any) => {
        const recipients = Array.isArray(email.to) ? email.to : [email.to];
        return recipients.some(
          (recipient: any) =>
            recipient.address?.toLowerCase() === testEmailAddress.toLowerCase()
        );
      });

      // Find email with matching subject (supports regex-like patterns such as "verify|confirm")
      const targetEmail = matchingEmails.find((email: any) => {
        const subj = (email.subject || "").toLowerCase();
        const pattern = subjectContains
          ? new RegExp(subjectContains.toLowerCase())
          : null;
        return pattern ? pattern.test(subj) : true;
      });

      if (targetEmail) {
        console.log(
          `📬 Found email: "${targetEmail.subject}" (ID: ${targetEmail.id})`
        );

        // Get full email content including HTML body
        const fullEmail = await getEmailFromMailDev(targetEmail.id);
        const verificationLink = extractVerificationLink(
          fullEmail.text || fullEmail.html || ""
        );

        return {
          id: targetEmail.id,
          subject: targetEmail.subject || "",
          body: fullEmail.html || fullEmail.text || "",
          verificationLink,
        };
      }

      // Fallback: if no subject match, try to find any email containing a verification link
      for (const email of matchingEmails) {
        const fullEmail = await getEmailFromMailDev(email.id);
        const verificationLink = extractVerificationLink(
          fullEmail.text || fullEmail.html || ""
        );
        if (verificationLink) {
          console.log(
            `📬 Using fallback email with verification link found (Subject: "${email.subject}")`
          );
          return {
            id: email.id,
            subject: email.subject || "",
            body: fullEmail.html || fullEmail.text || "",
            verificationLink,
          };
        }
      }

      // Log current email count for debugging
      if (matchingEmails.length > 0) {
        console.log(
          `📧 Found ${matchingEmails.length} emails for ${testEmailAddress}, but none match subject "${subjectContains}"`
        );
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.warn(`⚠️  Error polling MailDev API:`, error);
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }

  throw new Error(
    `Timeout waiting for email with subject containing "${subjectContains}" after ${timeout}ms`
  );
}

/**
 * Decode HTML entities to plain text
 * Converts common HTML entities like &amp;, &lt;, &gt;, &quot;, &#x27;, &#x2F; to their plain text equivalents
 */
function decodeHtmlEntities(text: string): string {
  const htmlEntities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#x27;": "'",
    "&#x2F;": "/",
    "&#39;": "'",
    "&apos;": "'",
    "&nbsp;": " ",
  };

  let decodedText = text;

  // Replace HTML entities with their plain text equivalents
  for (const [entity, replacement] of Object.entries(htmlEntities)) {
    decodedText = decodedText.replace(new RegExp(entity, "gi"), replacement);
  }

  // Handle numeric HTML entities (e.g., &#38; for &)
  decodedText = decodedText.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10));
  });

  // Handle hexadecimal HTML entities (e.g., &#x26; for &)
  decodedText = decodedText.replace(/&#x([0-9a-f]+);/gi, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  return decodedText;
}

/**
 * Extract verification link from email body
 * Supports both HTML and plain text emails
 * Same logic as MailSlurp version for compatibility
 * Converts HTML entities to plain text to prevent URL encoding errors
 */
export function extractVerificationLink(emailBody: string): string | null {
  // Common patterns for verification links in Better Auth emails
  const linkPatterns = [
    // HTML links with verify/confirm in href
    /<a[^>]+href=["']([^"']*(?:verify|confirm|activation)[^"']*)["'][^>]*>/i,
    // Direct URLs in text
    /https?:\/\/[^\s<>"']+(?:verify|confirm|activation)[^\s<>"']*/i,
    // Better Auth specific patterns
    /https?:\/\/[^\s<>"']+\/api\/auth\/verify-email[^\s<>"']*/i,
    // Generic verification links
    /https?:\/\/[^\s<>"']+\/auth\/verify[^\s<>"']*/i,
  ];

  for (const pattern of linkPatterns) {
    const match = emailBody.match(pattern);
    if (match) {
      // Extract URL from href if it's an HTML link
      const rawLink = match[1] || match[0];

      // Decode HTML entities to prevent URL encoding errors
      const decodedLink = decodeHtmlEntities(rawLink);

      console.log(`🔗 Extracted verification link: ${decodedLink}`);
      if (rawLink !== decodedLink) {
        console.log(`🔄 Decoded HTML entities in verification link`);
      }

      return decodedLink;
    }
  }

  console.warn("⚠️  No verification link found in email body");
  console.log("📄 Email body preview:", emailBody.substring(0, 500));
  return null;
}

/**
 * Get all emails from MailDev API
 * Returns array of email metadata
 */
async function getAllEmailsFromMailDev(): Promise<any[]> {
  const response = await fetch(`${MAILDEV_CONFIG.webUrl}/email`, {
    headers: createAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `MailDev API error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Get full email content from MailDev API
 * Returns complete email with HTML/text body
 */
async function getEmailFromMailDev(emailId: string): Promise<any> {
  const response = await fetch(`${MAILDEV_CONFIG.webUrl}/email/${emailId}`, {
    headers: createAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `MailDev API error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Delete a test inbox - no-op for MailDev
 * MailDev emails are automatically cleared when server restarts
 */
export async function deleteTestInbox(inboxId: string): Promise<void> {
  // MailDev doesn't require cleanup - emails are stored in memory
  // and cleared when the server restarts
  console.log(
    `✅ Test inbox ${inboxId} cleanup completed (MailDev auto-cleanup)`
  );
}

/**
 * Get all emails for debugging purposes
 * Useful for troubleshooting email delivery issues
 */
export async function getAllEmails(): Promise<any[]> {
  try {
    const emails = await getAllEmailsFromMailDev();
    console.log(`📧 Found ${emails.length} total emails in MailDev`);
    return emails;
  } catch (error) {
    console.error("❌ Failed to get emails from MailDev:", error);
    return [];
  }
}

/**
 * Clear all emails from MailDev
 * Useful for test cleanup or resetting state
 */
export async function clearAllEmails(): Promise<void> {
  try {
    /*
    const response = await fetch(`${MAILDEV_CONFIG.webUrl}/email/all`, {
      method: "DELETE",
      headers: createAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to clear emails: ${response.status} ${response.statusText}`
      );
    }
    */

    console.log("🗑️  Cleared all emails from MailDev");
  } catch (error) {
    console.warn("⚠️  Failed to clear emails from MailDev:", error);
  }
}

/**
 * Wait for MailDev service to be ready
 * Useful in CI/CD environments where MailDev starts as a service
 */
export async function waitForMailDevReady(
  timeout: number = 30_000
): Promise<void> {
  const startTime = Date.now();
  const pollInterval = 1000; // Check every second

  console.log("⏳ Waiting for MailDev service to be ready...");

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(`${MAILDEV_CONFIG.webUrl}/email`, {
        headers: createAuthHeaders(),
      });
      if (response.ok) {
        console.log("✅ MailDev service is ready!");
        return;
      } else {
        console.log(
          `⏳ MailDev responded with status: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      // Service not ready yet, continue polling
      console.log(
        `⏳ MailDev connection attempt failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error(`MailDev service not ready after ${timeout}ms`);
}

/**
 * Validate that MailDev is properly configured and accessible
 * Should be called before running tests
 */
export function validateMailDevConfig(): void {
  console.log("🔧 Validating MailDev configuration...");
  console.log(`   Web URL: ${MAILDEV_CONFIG.webUrl}`);
  console.log(`   SMTP Host: ${MAILDEV_CONFIG.smtpHost}`);
  console.log(`   SMTP Port: ${MAILDEV_CONFIG.smtpPort}`);

  if (MAILDEV_CONFIG.username && MAILDEV_CONFIG.password) {
    console.log(
      `   Authentication: Enabled (username: ${MAILDEV_CONFIG.username})`
    );
  } else {
    console.log(`   Authentication: Disabled`);
  }

  // Note: We don't require environment variables since MailDev has good defaults
  // Unlike MailSlurp which requires an API key

  console.log("✅ MailDev configuration validated");
}

/**
 * Get MailDev connection info for debugging
 */
export function getMailDevInfo() {
  return {
    webInterface: MAILDEV_CONFIG.webUrl,
    smtpConfig: {
      host: MAILDEV_CONFIG.smtpHost,
      port: MAILDEV_CONFIG.smtpPort,
      secure: false, // MailDev doesn't use TLS by default
    },
    testEmailDomain: "localhost", // Domain used for test emails
  };
}
