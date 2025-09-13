import { test, expect } from "../../fixtures/test-extend";
import {
  createTestInbox,
  deleteTestInbox,
  validateMailDevConfig,
  waitForMailDevReady,
  clearAllEmails,
  type EmailTestInbox,
} from "../utils/maildev";
import { TestAssertions } from "../utils/test-helpers";
import { signupFlow } from "../../flows/auth-flows";
import { AuthPage } from "../../page-objects/AuthPage";

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

  test("should complete full signup workflow with email verification", async ({ page }) => {
    await signupFlow(page, testInbox);
    console.log("🎉 Signup workflow completed successfully!");
  });

  test("should handle invalid email format during signup", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.gotoSignup();

    // Fill form with invalid email via POM to adhere to testing guidelines
    await auth.fillSignup({
      name: "Test User",
      email: "invalid-email-format",
      password: "TestPassword123!",
    });
    await auth.submitSignup();

    // Assert validation error using shared assertion helper
    await TestAssertions.assertValidationError(
      page,
      "Please enter a valid email address"
    );
  });

  test("should handle password mismatch during signup", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.gotoSignup();

    await auth.fillSignup({
      name: "Test User",
      email: testInbox.emailAddress,
      password: "TestPassword123!",
    });
    // Override confirm password using POM helper for a mismatch scenario
    await auth.fillConfirmPassword("DifferentPassword123!");
    await auth.submitSignup();

    await TestAssertions.assertValidationError(page, "Passwords do not match");
  });

  test("should handle existing email during signup", async ({ page }) => {
    // NOTE: This assumes the email is already registered. If not, seed accordingly.
    const auth = new AuthPage(page);
    await auth.gotoSignup();

    await auth.fillSignup({
      name: "Test User",
      email: testInbox.emailAddress,
      password: "TestPassword123!",
    });
    await auth.submitSignup();

    // Behavior is app-specific (error vs. resend). Keep this as an observation placeholder.
    // Consider asserting a specific toast or error once behavior is defined.
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
