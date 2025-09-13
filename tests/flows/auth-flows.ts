import { Page, expect } from "@playwright/test";
import { nanoid } from "nanoid";
import { AuthPage } from "../page-objects/AuthPage";
import { waitForEmailWithSubject, type EmailTestInbox } from "../e2e/utils/maildev";

export async function signupFlow(page: Page, inbox: EmailTestInbox, options: { skipOnboarding?: boolean } = {}) {
  const auth = new AuthPage(page);
  await auth.gotoSignup();

  const user = {
    name: `Test User ${nanoid(10)}`,
    email: inbox.emailAddress,
    password: "TestPassword123!",
  };

  await auth.fillSignup(user);
  await auth.submitSignup();
  await auth.assertOnVerificationToast();

  const email = await waitForEmailWithSubject(inbox.id, "verify|confirm", 90_000);
  expect(email.verificationLink).toBeTruthy();
  await page.goto(email.verificationLink!);

  // Complete onboarding (organization creation) if present, via POM for reusability
  if (!options?.skipOnboarding) {
    await auth.completeOnboardingOrganizationIfPresent();
  } else {
    await auth.assertSignedIn(true);
  }

  return { user };
}

export async function signinFlow(page: Page, creds: { email: string; password: string }) {
  const auth = new AuthPage(page);
  await auth.gotoSignin();
  await auth.fillSignin(creds);
  await auth.submitSignin();
  await auth.assertSignedIn();
}

/**
 * Reusable logout flow
 * - Encapsulates sign-out behavior via the AuthPage POM
 * - Deterministic: waits for sign-out confirmation conditions
 */
export async function logoutFlow(page: Page) {
  const auth = new AuthPage(page);
  await auth.signOutIfVisible();
}


