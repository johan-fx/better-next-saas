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

    // First, we need to create and verify a user account
    console.log("📝 Creating user account first...");

    // Step 1: Navigate to signup page and create account
    await NavigationHelpers.goToSignup(page);
    await NavigationHelpers.fillSignupForm(page, testUser);
    await NavigationHelpers.submitSignupForm(page);

    // Step 2: Verify the account via email
    await TestAssertions.assertOnVerificationPage(page);

    console.log("📧 Waiting for verification email...");
    const verificationEmail = await waitForEmailWithSubject(
      testInbox.id,
      "verify",
      90_000
    );

    expect(verificationEmail.verificationLink).toBeTruthy();
    console.log("🔗 Clicking verification link...");
    await page.goto(verificationEmail.verificationLink!);

    // Step 3: Verify user is signed in after verification
    await TestAssertions.assertSignedIn(page, testUser.name);

    // Step 4: Sign out to test the signin workflow
    console.log("🚪 Signing out to test signin...");
    await page.click(AUTH_SELECTORS.signOutButton);

    // Wait for sign out to complete
    await page.waitForTimeout(2000);

    // Step 5: Navigate to signin page
    console.log("🔑 Testing signin workflow...");
    await NavigationHelpers.goToSignin(page);

    // Step 6: Fill out and submit signin form
    await NavigationHelpers.fillSigninForm(page, {
      email: testUser.email,
      password: testUser.password,
    });
    await NavigationHelpers.submitSigninForm(page);

    // Step 7: Verify successful signin and redirect to dashboard
    await TestAssertions.assertSignedIn(page, testUser.name);

    console.log("🎉 Signin workflow completed successfully!");
  });

  test("should handle invalid email format during signin", async ({ page }) => {
    const invalidEmail = "invalid-email-format";

    // Navigate to signin page
    await NavigationHelpers.goToSignin(page);

    // Fill form with invalid email
    await page.fill(AUTH_SELECTORS.emailInput, invalidEmail);
    await page.fill(AUTH_SELECTORS.passwordInput, "somepassword");

    // Submit form
    await page.click(AUTH_SELECTORS.submitButton);

    // Verify validation error appears
    await TestAssertions.assertValidationError(
      page,
      "Please enter a valid email address"
    );
  });

  test("should handle empty required fields during signin", async ({
    page,
  }) => {
    // Navigate to signin page
    await NavigationHelpers.goToSignin(page);

    // Try to submit form without filling any fields
    await page.click(AUTH_SELECTORS.submitButton);

    // Verify validation errors appear for both fields
    await TestAssertions.assertValidationError(page, "Email is required");
    await TestAssertions.assertValidationError(page, "Password is required");
  });

  test("should handle invalid credentials during signin", async ({ page }) => {
    // Navigate to signin page
    await NavigationHelpers.goToSignin(page);

    // Fill form with non-existent user credentials
    await NavigationHelpers.fillSigninForm(page, {
      email: "nonexistent@example.com",
      password: "wrongpassword123",
    });
    await NavigationHelpers.submitSigninForm(page);

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
    await NavigationHelpers.goToSignup(page);
    await NavigationHelpers.fillSignupForm(page, testUser);
    await NavigationHelpers.submitSignupForm(page);

    // Step 2: Navigate to signin page without verifying
    await NavigationHelpers.goToSignin(page);

    // Step 3: Try to sign in with unverified account
    await NavigationHelpers.fillSigninForm(page, {
      email: testUser.email,
      password: testUser.password,
    });
    await NavigationHelpers.submitSigninForm(page);

    // Step 4: Verify user is redirected to email verification page
    // Better Auth should handle this automatically based on your configuration
    await TestAssertions.assertOnVerificationPage(page);
  });

  test("should navigate to sign-up page from signin page", async ({ page }) => {
    await NavigationHelpers.goToSignin(page);

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

  test("should show and hide password in signin form", async ({ page }) => {
    await NavigationHelpers.goToSignin(page);

    const passwordInput = page.locator(AUTH_SELECTORS.passwordInput);
    const passwordToggle = page.locator(AUTH_SELECTORS.passwordToggle);

    // Fill password
    await passwordInput.fill("testpassword123");

    // Verify password is hidden by default
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Click toggle to show password
    await passwordToggle.click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    // Click toggle again to hide password
    await passwordToggle.click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });
});

test.describe("Sign-In Form Validation", () => {
  test("should disable submit button while form is loading", async ({
    page,
  }) => {
    await NavigationHelpers.goToSignin(page);

    const submitButton = page.locator(AUTH_SELECTORS.submitButton);

    // Fill form with valid data
    await NavigationHelpers.fillSigninForm(page, {
      email: "test@example.com",
      password: "validpassword123",
    });

    // Submit form and quickly check if button is disabled
    await submitButton.click();

    // The button should be disabled during the request
    // Note: This test might be flaky depending on network speed
    // Consider using page.route() to mock slow responses if needed
    await expect(submitButton).toBeDisabled();
  });

  test("should display loading state during signin", async ({ page }) => {
    await NavigationHelpers.goToSignin(page);

    // Fill form with valid data
    await NavigationHelpers.fillSigninForm(page, {
      email: "test@example.com",
      password: "validpassword123",
    });

    // Submit form
    const submitButton = page.locator(AUTH_SELECTORS.submitButton);
    await submitButton.click();

    // Check for loading spinner or text
    const loadingIndicator = page.locator(
      '[class*="animate-spin"], text="Signing In"'
    );
    await expect(loadingIndicator).toBeVisible();
  });
});
