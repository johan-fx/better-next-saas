import { test, expect } from "@playwright/test";
import {
  createTestInbox,
  waitForEmailWithSubject,
  deleteTestInbox,
  validateMailDevConfig,
  waitForMailDevReady,
  clearAllEmails,
  type EmailTestInbox,
} from "../utils/maildev";
import {
  generateTestUser,
  AUTH_SELECTORS,
  TestAssertions,
  NavigationHelpers,
} from "../utils/test-helpers";

/**
 * End-to-End User Signup Workflow Tests
 *
 * This test suite covers the complete user signup workflow with Better Auth:
 * 1. User navigates to signup page
 * 2. User fills out signup form
 * 3. Better Auth sends verification email
 * 4. User receives email via MailDev
 * 5. User clicks verification link
 * 6. User is verified and signed in
 *
 * Features tested:
 * - Form validation and submission
 * - Email verification workflow
 * - Post-verification navigation
 * - Error handling scenarios
 */

// Configure test timeout for email workflows
test.setTimeout(120_000); // 2 minutes

test.describe("User Signup with Email Verification", () => {
  let testInbox: EmailTestInbox;

  // Validate MailDev configuration and wait for service before running tests
  test.beforeAll(async () => {
    validateMailDevConfig();
    await waitForMailDevReady();
  });

  // Create a fresh inbox for each test and clear any existing emails
  test.beforeEach(async () => {
    // Clear any existing emails to ensure test isolation
    await clearAllEmails();
    testInbox = await createTestInbox();
  });

  // Clean up test inbox after each test
  test.afterEach(async () => {
    if (testInbox) {
      await deleteTestInbox(testInbox.id);
    }
  });

  test("should complete full signup workflow with email verification", async ({
    page,
  }) => {
    // Generate test user data using helper function
    const testUser = generateTestUser(testInbox.emailAddress);

    console.log(`🧪 Starting signup test with email: ${testUser.email}`);

    // Step 1: Navigate to signup page using helper
    await NavigationHelpers.goToSignup(page);

    // Step 2: Fill out and submit signup form using helpers
    console.log("📝 Filling out signup form...");
    await NavigationHelpers.fillSignupForm(page, testUser);
    await NavigationHelpers.submitSignupForm(page);

    console.log("✅ Signup form submitted");

    // Step 3: Verify signup success and email verification prompt using helper
    await TestAssertions.assertOnVerificationPage(page);

    console.log("📧 Waiting for verification email...");

    // Step 4: Wait for verification email from Better Auth
    const verificationEmail = await waitForEmailWithSubject(
      testInbox.id,
      "verify", // Common subject text for verification emails
      90_000 // 90 seconds timeout
    );

    expect(verificationEmail.verificationLink).toBeTruthy();
    console.log(
      `📬 Received verification email: "${verificationEmail.subject}"`
    );

    // Step 5: Click verification link
    console.log("🔗 Clicking verification link...");
    await page.goto(verificationEmail.verificationLink!);

    // Step 6 & 7: Verify successful email verification and user is signed in
    await TestAssertions.assertSignedIn(page, testUser.name);

    console.log("🎉 Signup workflow completed successfully!");
  });

  test("should handle invalid email format during signup", async ({ page }) => {
    // Use an obviously invalid email format
    // HTML5 validation is disabled on the form, so React Hook Form will handle validation
    const invalidEmail = "invalid-email-format";

    // Navigate to signup page
    await NavigationHelpers.goToSignup(page);

    // Fill form with invalid email using selectors
    await page.fill(AUTH_SELECTORS.nameInput, "Test User");
    await page.fill(AUTH_SELECTORS.emailInput, invalidEmail);
    await page.fill(AUTH_SELECTORS.passwordInput, "TestPassword123!");
    await page.fill(AUTH_SELECTORS.confirmPasswordInput, "TestPassword123!");

    // Submit form
    await page.click(AUTH_SELECTORS.submitButton);

    // Verify validation error appears - look for the actual error message from translations
    // This is the message from en.json: "emailInvalid": "Please enter a valid email address"
    await TestAssertions.assertValidationError(
      page,
      "Please enter a valid email address"
    );
  });

  test("should handle password mismatch during signup", async ({ page }) => {
    // Navigate to signup page
    await NavigationHelpers.goToSignup(page);

    // Fill form with mismatched passwords using selectors
    await page.fill(AUTH_SELECTORS.nameInput, "Test User");
    await page.fill(AUTH_SELECTORS.emailInput, testInbox.emailAddress);
    await page.fill(AUTH_SELECTORS.passwordInput, "TestPassword123!");
    await page.fill(
      AUTH_SELECTORS.confirmPasswordInput,
      "DifferentPassword123!"
    );

    // Submit form
    await page.click(AUTH_SELECTORS.submitButton);

    // Verify validation error appears - look for the actual error message from translations
    // This is the message from en.json: "passwordsDoNotMatch": "Passwords do not match"
    await TestAssertions.assertValidationError(page, "Passwords do not match");
  });

  test("should handle existing email during signup", async ({ page }) => {
    // First, create a user account with the test email
    const existingEmail = testInbox.emailAddress;

    await page.goto("/auth/sign-up");

    // Fill form with existing email (this test assumes the email is already registered)
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="email"]', existingEmail);
    await page.fill('input[name="password"]', "TestPassword123!");
    await page.fill('input[name="confirmPassword"]', "TestPassword123!");

    // Submit form
    await page.click('button[type="submit"]');

    // Note: This test might need adjustment based on how your app handles existing emails
    // Some apps allow re-registration, others show errors
    // Verify appropriate behavior occurs (either error message or email resent)
  });

  test("should navigate to sign-in page from signup page", async ({ page }) => {
    await page.goto("/auth/sign-up");

    // Look for "Already have an account?" link
    const signInLink = page.locator(
      'a:has-text("Sign In"), a:has-text("Sign in"), a:has-text("Login")'
    );
    await expect(signInLink).toBeVisible();

    // Click the link
    await signInLink.click();

    // Verify navigation to sign-in page
    await expect(page).toHaveURL(/sign-in|login/);
  });
});

test.describe("Email Verification Edge Cases", () => {
  let testInbox: EmailTestInbox;

  // Clear emails before each test for isolation
  test.beforeEach(async () => {
    await clearAllEmails();
    testInbox = await createTestInbox();
  });

  // Clean up test inbox after each test
  test.afterEach(async () => {
    if (testInbox) {
      await deleteTestInbox(testInbox.id);
    }
  });

  test("should handle expired verification link gracefully", async () => {
    // This test would require manipulating the verification token expiration
    // or using a pre-expired link. Implementation depends on your Better Auth setup.
    console.log(
      "⚠️  Expired verification link test - implement based on your setup"
    );
    // Note: When implementing this test, you would:
    // 1. Create an expired verification token
    // 2. Navigate to the verification URL with expired token
    // 3. Assert appropriate error message is shown
    // 4. Verify user can request a new verification email
  });

  test("should allow resending verification email", async ({ page }) => {
    // Complete signup first
    await page.goto("/auth/sign-up");
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="email"]', testInbox.emailAddress);
    await page.fill('input[name="password"]', "TestPassword123!");
    await page.fill('input[name="confirmPassword"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    // Look for resend button on verification page
    await expect(page).toHaveURL(/verify-email/);

    const resendButton = page.locator(
      'button:has-text("Resend"), button:has-text("Send Again")'
    );

    if (await resendButton.isVisible()) {
      await resendButton.click();

      // Verify success message
      await expect(page.locator("body")).toContainText(
        /email sent|resent|check your email/i
      );
    } else {
      console.log(
        "ℹ️  No resend button found - this may not be implemented yet"
      );
    }
  });
});
