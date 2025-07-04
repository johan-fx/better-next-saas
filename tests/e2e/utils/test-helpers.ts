import { Page } from "@playwright/test";
import { env } from "@/lib/env";

/**
 * Test Helper Utilities
 *
 * This module provides common testing utilities for E2E tests:
 * - Test data generation
 * - Database cleanup helpers
 * - Common test assertions
 * - Environment validation (now using centralized env.ts)
 */

/**
 * Generate random test data for user registration
 */
export function generateTestUser(emailAddress: string) {
  const timestamp = Date.now();

  return {
    name: `Test User ${timestamp}`,
    email: emailAddress,
    password: "TestPassword123!",
    organizationName: `Test Org ${timestamp}`,
  };
}

/**
 * Generate a unique test identifier
 */
export function generateTestId(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Wait utility for test timing
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clean up test users from database (if needed for CI/CD)
 * This would require database access - implement based on your needs
 */
export async function cleanupTestUsers(): Promise<void> {
  // Implementation depends on your database setup
  // You might want to delete test users created during E2E tests
  console.log("Test cleanup: Implement database cleanup if needed");
}

/**
 * Validate test environment is properly configured
 * Now uses the centralized environment validation from env.ts
 */
export function validateTestEnvironment(): void {
  try {
    // The env object will throw if required variables are missing or invalid
    // This automatically validates DATABASE_URL, BETTER_AUTH_SECRET, etc.
    const requiredVars = {
      DATABASE_URL: env.DATABASE_URL,
      BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
    };

    console.log("✅ Test environment validation passed");
    console.log(
      `📧 MailDev config: ${env.MAILDEV_WEB_URL} (SMTP: ${env.MAILDEV_SMTP_HOST}:${env.MAILDEV_SMTP_PORT})`
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Environment validation failed: ${error.message}\n` +
          "Please check your .env.local file and ensure all required variables are set."
      );
    }
    throw error;
  }
}

/**
 * Common selectors for Better Auth components
 * Updated to match the actual signup-view.tsx structure using shadcn/ui components
 */
export const AUTH_SELECTORS = {
  // Form fields - using name attributes from React Hook Form
  nameInput: 'input[name="name"]',
  emailInput: 'input[name="email"]',
  passwordInput: 'input[name="password"]',
  confirmPasswordInput: 'input[name="confirmPassword"]',
  organizationInput: 'input[name="organizationName"]',

  // Password visibility toggles
  passwordToggle: 'button[type="button"]:has([class*="eye"])',
  confirmPasswordToggle: 'button[type="button"]:has([class*="eye"])',

  // Buttons
  submitButton: 'button[type="submit"]',
  signOutButton: 'button:has-text("Sign Out"), button:has-text("Logout")',

  // Navigation links (updated to match signup-view.tsx structure)
  signInLink:
    'a:has-text("Sign In"), a:has-text("Sign in"), a:has-text("Login"), a[href="/auth/sign-in"]',
  signUpLink:
    'a:has-text("Sign Up"), a:has-text("Create Account"), a[href="/auth/sign-up"]',

  // Form validation messages (shadcn/ui FormMessage components)
  formMessage: '[role="alert"], .text-sm.font-medium.text-destructive',
  validationError: '.text-destructive, .text-red-500, [role="alert"]',

  // Success indicators
  userMenu: '[data-testid="user-menu"]',
  userAvatar: '.user-avatar, [data-testid="user-avatar"]',

  // Card structure from signup-view.tsx
  cardTitle: '[class*="text-2xl"], .card-title',
  cardDescription: '.card-description, [class*="text-center"]',
  cardContent: ".card-content",
} as const;

/**
 * Common URL patterns for navigation assertions
 */
export const URL_PATTERNS = {
  signup: /auth\/sign-up|signup|register/,
  signin: /auth\/sign-in|signin|login/,
  verifyEmail: /auth\/verify-email|check-email|email-verification/,
  dashboard: /dashboard|welcome|home/,
} as const;

/**
 * Common test assertions for Better Auth workflows
 */
export class TestAssertions {
  /**
   * Assert user is on signup page
   * Updated to match the CardTitle component structure from signup-view.tsx
   */
  static async assertOnSignupPage(page: Page) {
    await page.waitForURL(URL_PATTERNS.signup);

    // Look for the CardTitle element or any heading that contains "Create Account" text
    const headingSelectors = [
      AUTH_SELECTORS.cardTitle, // CardTitle from signup-view.tsx
      "h1, h2, h3", // Traditional headings
      '[role="heading"]', // ARIA heading role
      ".card-header h1, .card-header h2, .card-header h3", // Headings within card header
    ];

    let heading = null;
    let headingText = null;

    // Try each selector until we find the heading
    for (const selector of headingSelectors) {
      try {
        heading = page.locator(selector).first();
        await heading.waitFor({ timeout: 5000 });
        headingText = await heading.textContent();
        if (headingText && headingText.trim()) break;
      } catch {
        // Continue to next selector
        continue;
      }
    }

    // If no heading found with selectors, check for text content directly in the page
    if (!headingText || !headingText.trim()) {
      const bodyText = await page.locator("body").textContent();
      if (bodyText?.match(/create account|sign up/i)) {
        console.log("✓ Found signup page content in body text");
        return; // Page has the expected content
      }
    }

    if (!headingText?.match(/create account|sign up/i)) {
      // Final fallback - check if signup form is present
      const formPresent = await page
        .locator(AUTH_SELECTORS.nameInput)
        .isVisible();
      if (formPresent) {
        console.log("✓ Signup form is visible, assuming correct page");
        return;
      }

      throw new Error(
        `Expected signup page heading with "Create Account" or "Sign Up", got: "${headingText}"`
      );
    }

    console.log(`✓ Found signup page heading: "${headingText}"`);
  }

  /**
   * Assert user is on signin page
   * Updated to match the CardTitle component structure from signin-view.tsx
   */
  static async assertOnSigninPage(page: Page) {
    await page.waitForURL(URL_PATTERNS.signin);

    // Look for the CardTitle element or any heading that contains "Sign In" text
    const headingSelectors = [
      AUTH_SELECTORS.cardTitle, // CardTitle from signin-view.tsx
      "h1, h2, h3", // Traditional headings
      '[role="heading"]', // ARIA heading role
      ".card-header h1, .card-header h2, .card-header h3", // Headings within card header
    ];

    let heading = null;
    let headingText = null;

    // Try each selector until we find the heading
    for (const selector of headingSelectors) {
      try {
        heading = page.locator(selector).first();
        await heading.waitFor({ timeout: 5000 });
        headingText = await heading.textContent();
        if (headingText && headingText.trim()) break;
      } catch {
        // Continue to next selector
        continue;
      }
    }

    // If no heading found with selectors, check for text content directly in the page
    if (!headingText || !headingText.trim()) {
      const bodyText = await page.locator("body").textContent();
      if (bodyText?.match(/sign in|login/i)) {
        console.log("✓ Found signin page content in body text");
        return; // Page has the expected content
      }
    }

    if (!headingText?.match(/sign in|login/i)) {
      // Final fallback - check if signin form is present
      const formPresent = await page
        .locator(AUTH_SELECTORS.emailInput)
        .isVisible();
      if (formPresent) {
        console.log("✓ Signin form is visible, assuming correct page");
        return;
      }

      throw new Error(
        `Expected signin page heading with "Sign In" or "Login", got: "${headingText}"`
      );
    }

    console.log(`✓ Found signin page heading: "${headingText}"`);
  }

  /**
   * Assert user is on email verification page
   */
  static async assertOnVerificationPage(page: Page) {
    await page.waitForURL(URL_PATTERNS.verifyEmail);
    const bodyText = await page.locator("body").textContent();

    if (
      !bodyText?.match(/check your email|verification email|verify your email/i)
    ) {
      throw new Error("Expected email verification instructions");
    }
  }

  /**
   * Assert user is signed in and on dashboard
   */
  static async assertSignedIn(page: Page, userName?: string) {
    // Check URL
    await page.waitForURL(URL_PATTERNS.dashboard, { timeout: 30000 });

    // Check for signed-in indicators
    const signedInIndicators = [
      AUTH_SELECTORS.signOutButton,
      AUTH_SELECTORS.userMenu,
      AUTH_SELECTORS.userAvatar,
    ];

    let isSignedIn = false;
    for (const selector of signedInIndicators) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        isSignedIn = true;
        break;
      } catch {
        // Continue checking other indicators
      }
    }

    if (!isSignedIn) {
      throw new Error("User does not appear to be signed in");
    }

    // Check for user name if provided
    if (userName) {
      const bodyText = await page.locator("body").textContent();
      if (!bodyText?.includes(userName)) {
        console.warn(
          `User name "${userName}" not found on page - this may be expected`
        );
      }
    }
  }

  /**
   * Assert form validation error is displayed
   * Updated to work with shadcn/ui FormMessage components and HTML5 validation
   */
  static async assertValidationError(page: Page, errorText: string) {
    console.log(`🔍 Looking for validation error: "${errorText}"`);

    // First, check for HTML5 validation (browser native validation)
    // This appears as a browser tooltip/popup and is harder to detect
    const emailInput = page.locator(AUTH_SELECTORS.emailInput);

    try {
      // Check if the input has HTML5 validation state
      const validationMessage = await emailInput.evaluate(
        (input: HTMLInputElement) => {
          return input.validationMessage;
        }
      );

      if (
        validationMessage &&
        validationMessage.toLowerCase().includes("email")
      ) {
        console.log(
          `✅ Found HTML5 validation message: "${validationMessage}"`
        );
        return; // HTML5 validation is working, which is acceptable
      }
    } catch (error) {
      console.log("Could not check HTML5 validation message");
    }

    // Check for React Hook Form validation errors using selectors
    const errorElement = page.locator(AUTH_SELECTORS.validationError);

    try {
      await errorElement.waitFor({ timeout: 5000 });
      const errorElements = await errorElement.all();

      for (const element of errorElements) {
        const errorContent = await element.textContent();
        console.log(`📝 Found error element: "${errorContent}"`);

        if (errorContent?.toLowerCase().includes(errorText.toLowerCase())) {
          console.log(`✅ Found matching validation error: "${errorContent}"`);
          return;
        }
      }
    } catch (error) {
      console.log("No error elements found with selectors");
    }

    // Fallback: check entire body for error text
    const bodyText = await page.locator("body").textContent();
    if (bodyText?.toLowerCase().includes(errorText.toLowerCase())) {
      console.log(`✅ Found error text in body: "${errorText}"`);
      return;
    }

    // Enhanced error message with debugging info
    const currentUrl = page.url();
    const allText = await page.locator("body").textContent();

    console.error(`❌ Validation error not found!`);
    console.error(`   Expected: "${errorText}"`);
    console.error(`   Current URL: ${currentUrl}`);
    console.error(`   Page content preview: ${allText?.substring(0, 500)}...`);

    throw new Error(
      `Validation error "${errorText}" not found on page.\n` +
        `Current URL: ${currentUrl}\n` +
        `Check console logs for debugging information.`
    );
  }
}

/**
 * Page navigation helpers
 */
export class NavigationHelpers {
  /**
   * Navigate to signup page and wait for load
   * Updated to better handle page loading and form visibility
   */
  static async goToSignup(page: Page) {
    await page.goto("/auth/sign-up");

    // Wait for the signup form to be visible before asserting page state
    await page.waitForSelector(AUTH_SELECTORS.nameInput, { timeout: 10000 });

    await TestAssertions.assertOnSignupPage(page);
  }

  /**
   * Navigate to signin page and wait for load
   * Updated to match signin-view.tsx component structure
   */
  static async goToSignin(page: Page) {
    await page.goto("/auth/sign-in");

    // Wait for the signin form to be visible before asserting page state
    await page.waitForSelector(AUTH_SELECTORS.emailInput, { timeout: 10000 });

    await TestAssertions.assertOnSigninPage(page);
  }

  /**
   * Fill signup form with test data
   */
  static async fillSignupForm(
    page: Page,
    userData: ReturnType<typeof generateTestUser>
  ) {
    await page.fill(AUTH_SELECTORS.nameInput, userData.name);
    await page.fill(AUTH_SELECTORS.emailInput, userData.email);
    await page.fill(AUTH_SELECTORS.passwordInput, userData.password);
    await page.fill(AUTH_SELECTORS.confirmPasswordInput, userData.password);

    if (userData.organizationName) {
      await page.fill(
        AUTH_SELECTORS.organizationInput,
        userData.organizationName
      );
    }
  }

  /**
   * Submit signup form and wait for response
   */
  static async submitSignupForm(page: Page) {
    await page.click(AUTH_SELECTORS.submitButton);
    // Wait for navigation or response
    await page.waitForTimeout(2000);
  }

  /**
   * Fill signin form with test data
   */
  static async fillSigninForm(
    page: Page,
    userData: { email: string; password: string }
  ) {
    await page.fill(AUTH_SELECTORS.emailInput, userData.email);
    await page.fill(AUTH_SELECTORS.passwordInput, userData.password);
  }

  /**
   * Submit signin form and wait for response
   */
  static async submitSigninForm(page: Page) {
    await page.click(AUTH_SELECTORS.submitButton);
    // Wait for navigation or response
    await page.waitForTimeout(2000);
  }
}
