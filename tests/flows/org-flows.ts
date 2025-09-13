import { Page, expect } from "@playwright/test";
import { waitForEmailWithSubject, type EmailTestInbox } from "../e2e/utils/maildev";
import { signupFlow } from "./auth-flows";
import { AuthPage } from "../page-objects/AuthPage";

/**
 * Organization-related reusable flows
 * - Follow testing-guidelines: DRY, resilient selectors, domain-level helpers
 */

/**
 * Accept an organization invitation for the invited user.
 * - Waits for the invitation email
 * - Opens the accept-invitation link
 * - Completes signup for the invited email if required
 * - Accepts the invitation from the welcome card and asserts confirmation
 */
export async function acceptInvitationFlow(
  page: Page,
  invitedInbox: EmailTestInbox,
  options: { emailTimeoutMs?: number } = {}
) {
  const emailTimeout = options.emailTimeoutMs ?? 90_000;

  // 1) Wait for invitation email and extract the accept link
  const invitationEmail = await waitForEmailWithSubject(
    invitedInbox.id,
    "invite|invitation",
    emailTimeout
  );
  const acceptLink = extractAcceptInvitationLink(invitationEmail.body);
  expect(acceptLink, "Accept invitation link not found in email body").toBeTruthy();

  // 2) Navigate to the accept link
  await page.goto(acceptLink!);

  // 3) If we are routed via auth, complete signup with the invited email (skip onboarding)
  await signupFlow(page, invitedInbox, { skipOnboarding: true });

  // 4) Accept invitation from the welcome card
  const auth = new AuthPage(page);
  await auth.waitForAcceptInvitationCard();
  await auth.acceptInvitationAndAssertToast();

  // 5) After accepting, user should land in an authenticated area (typically /account)
  await page.waitForURL(/\/account/, { timeout: 30_000 });
}

function extractAcceptInvitationLink(body: string): string | null {
  // Try to find link in href first
  const hrefMatch = body.match(
    /href=["']([^"']*\/auth\/accept-invitation\?invitationId=[^"'\s<]+)["']/i
  );
  if (hrefMatch) return hrefMatch[1];

  // Fallback: plain URL in text
  const urlMatch = body.match(
    /https?:\/\/[^\s<>\'\"]+\/auth\/accept-invitation\?invitationId=[^\s<>\'\"]/i
  );
  return urlMatch ? urlMatch[0] : null;
}


