import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration for E2E Testing
 *
 * This configuration file sets up Playwright for end-to-end testing
 * with proper environment variables, timeout settings, and CI/CD support.
 *
 * Features:
 * - Better Auth email verification testing
 * - MailSlurp integration for email testing
 * - Multiple browser support
 * - CI/CD pipeline ready
 */

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

export default defineConfig({
  // Test directory structure
  testDir: "./tests/e2e",

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use. See https://playwright.dev/docs/test-reporters
  reporter: [["html"], ["list"]], // TODO: Fix GitHub reporter configuration

  // Global test timeout - important for email verification workflows
  timeout: 120000, // 2 minutes for email delivery

  // Expect timeout for assertions
  expect: {
    timeout: 30000, // 30 seconds
  },

  // Shared settings for all the projects below.
  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

    // Collect trace when retrying the failed test.
    trace: "on-first-retry",

    // Take screenshots on failure
    screenshot: "only-on-failure",

    // Record video on failure
    video: "retain-on-failure",

    // Global test setup
    extraHTTPHeaders: {
      // Add any global headers if needed
    },
  },

  // Configure projects for major browsers.
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  // Run your local dev server before starting the tests
  webServer: process.env.CI
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000, // 2 minutes
      },
});
