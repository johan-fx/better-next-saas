import { test, expect } from "../../fixtures/test-extend";
import { createTestInbox, deleteTestInbox, validateMailDevConfig, waitForMailDevReady, clearAllEmails, type EmailTestInbox } from "../utils/maildev";
import {
  generateTestUser,
  AUTH_SELECTORS,
  TestAssertions,
} from "../utils/test-helpers";
import { signupFlow, signinFlow, logoutFlow } from "../../flows/auth-flows";
import { AuthPage } from "../../page-objects/AuthPage";

/**
 * End-to-End User Sign-In Workflow Tests
 *
 * This test suite covers the complete user sign-in workflow with Better Auth:
 * 1. User navigates to signin page
 * 2. User fills out signin form with valid credentials
 * 3. Better Auth authenticates the user
 * 4. User is redirected to dashboard
 * 5. User session is established
 *
 * Features tested:
 * - Form validation and submission
 * - Email/password authentication
 * - Post-signin navigation
 * - Error handling scenarios
 * - Email verification requirement
 * - Invalid credentials handling
 */

// Configure test timeout for auth workflows
test.setTimeout(60_000);

test.describe("User Sign-In with Email and Password", () => {
  let testInbox: EmailTestInbox;
  let testUser: ReturnType<typeof generateTestUser>;

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
    testUser = generateTestUser(testInbox.emailAddress);
  });

  // Clean up test inbox after each test
  test.afterEach(async () => {
    if (testInbox) {
      await deleteTestInbox(testInbox.id);
    }
  });

  test("should complete full signin workflow with verified user", async ({
    page,
  }) => {
    console.log(`🧪 Starting signin test with email: ${testUser.email}`);

    // Create and verify a user account via flow
    await signupFlow(page, testInbox);

    // Step 4: Sign out to test the signin workflow
    console.log("🚪 Signing out to test signin...");
    await logoutFlow(page);

    // Step 5: Navigate to signin page
    console.log("🔑 Testing signin workflow...");
    await signinFlow(page, { email: testUser.email, password: testUser.password });

    console.log("🎉 Signin workflow completed successfully!");
  });

  test("should handle invalid email format during signin", async ({ page }) => {
    const invalidEmail = "invalid-email-format";

    const auth = new AuthPage(page);
    await auth.gotoSignin();
    await auth.fillSignin({ email: invalidEmail, password: "somepassword" });
    await auth.submitSignin();

    // Verify validation error appears
    await TestAssertions.assertValidationError(
      page,
      "Please enter a valid email address"
    );
  });

  test("should handle empty required fields during signin", async ({
    page,
  }) => {
    const auth = new AuthPage(page);
    await auth.gotoSignin();
    await auth.submitSignin();

    // Verify validation errors appear for both fields
    await TestAssertions.assertValidationError(page, "Email is required");
    await TestAssertions.assertValidationError(page, "Password is required");
  });

  test("should handle invalid credentials during signin", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.gotoSignin();
    await auth.fillSignin({ email: "nonexistent@example.com", password: "wrongpassword123" });
    await auth.submitSignin();

    // Verify error message appears
    // Note: The exact error message depends on your Better Auth configuration
    // It might be "Invalid email or password" or similar
    const errorMessage = page.locator('.toast, [role="alert"], .error-message');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });

    // Check that we're still on the signin page (not redirected)
    await expect(page).toHaveURL(/sign-in|login/);
  });

  test("should handle unverified user signin attempt", async ({ page }) => {
    console.log("🧪 Testing unverified user signin...");

    // Step 1: Create an account but don't verify it
    const auth = new AuthPage(page);
    await auth.gotoSignup();
    await auth.fillSignup(testUser);
    await auth.submitSignup();

    // Step 2: Navigate to signin page without verifying
    await auth.gotoSignin();

    // Step 3: Try to sign in with unverified account
    await auth.fillSignin({ email: testUser.email, password: testUser.password });
    await auth.submitSignin();

    // Step 4: Verify user is redirected to email verification page
    // Better Auth should handle this automatically based on your configuration
    const toast = page.locator('[data-sonner-toast]');

    // Primary assertion: one of the toasts should contain "Check your email" (case-insensitive)
    await expect(toast).toContainText(/email not verified/i, { timeout: 10_000 });
  });

  test("should navigate to sign-up page from signin page", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.gotoSignin();

    // Look for "Don't have an account?" link
    const signUpLink = page.locator(
      'a:has-text("Sign Up"), a:has-text("Create Account")'
    );
    await expect(signUpLink).toBeVisible();

    // Click the link
    await signUpLink.click();

    // Verify navigation to sign-up page
    await expect(page).toHaveURL(/sign-up|signup|register/);
  });
});

test.describe("Sign-In Form Validation", () => {
  test("should disable submit button while form is loading", async ({
    page,
  }) => {
    const auth = new AuthPage(page);
    await auth.gotoSignin();

    const submitButton = page.locator(AUTH_SELECTORS.submitButton);

    // Fill form with valid data
    await auth.fillSignin({ email: "test@example.com", password: "validpassword123" });

    // Submit form and quickly check if button is disabled
    await submitButton.click();

    // The button should be disabled during the request
    // Note: This test might be flaky depending on network speed
    // Consider using page.route() to mock slow responses if needed
    await expect(submitButton).toBeDisabled();
  });

  test("should display loading state during signin", async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.gotoSignin();

    // Fill form with valid data
    await auth.fillSignin({ email: "test@example.com", password: "validpassword123" });

    // Submit form
    const submitButton = page.locator(AUTH_SELECTORS.submitButton);
    await submitButton.click();

    // Check for loading spinner or text
    // Prefer robust check for a spinner without mixing selector syntaxes
    const spinner = page.locator('[class*="animate-spin"]');
    await expect(spinner.first()).toBeVisible();
  });
});
