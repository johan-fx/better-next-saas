import { Page, expect } from "@playwright/test";
import { nanoid } from "nanoid";

/**
 * AuthPage (POM)
 * - Encapsulates authentication page interactions (sign up / sign in)
 * - Uses accessibility-first selectors and resilient waits
 */
export class AuthPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private async dismissCookieBannerIfPresent() {
    const root = this.page.locator('[data-testid="cookie-banner-root"]');
    try {
      if (await root.isVisible({ timeout: 1000 })) {
        const accept = this.page.locator('[data-testid="cookie-banner-accept-button"]');
        if (await accept.isVisible({ timeout: 500 })) {
          await accept.click({ timeout: 2000 });
          return;
        }
        const close = this.page.locator('[data-testid="cookie-banner-close-button"], [data-testid="cookie-banner-customize-button"]');
        if (await close.isVisible({ timeout: 500 })) {
          await close.click({ timeout: 2000 });
        }
      }
    } catch {
      // ignore
    }
  }

  // Locators (stable and role/label based when possible)
  private get nameInput() {
    return this.page.getByRole("textbox", { name: /name/i });
  }
  private get emailInput() {
    return this.page.getByRole("textbox", { name: /email/i });
  }
  private get passwordInput() {
    return this.page.getByLabel(/password/i).first();
  }
  private get confirmPasswordInput() {
    return this.page.getByLabel(/confirm password/i).first();
  }
  private get signupButton() {
    return this.page.getByRole("button", { name: /create/i });
  }
  private get signinButton() {
    return this.page.getByRole("button", { name: /login/i });
  }
  private get signOutButton() {
    return this.page.getByRole("button", { name: /sign out|logout/i });
  }

  async gotoSignup() {
    await this.page.goto("/auth/sign-up");
    await this.page.waitForLoadState("domcontentloaded");

    // Form presence
    await expect(this.page.locator("form").first()).toBeVisible();
    // At least name + email present
    await expect(this.nameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await this.dismissCookieBannerIfPresent();
  }

  async gotoSignin() {
    await this.page.goto("/auth/sign-in");
    await this.page.waitForLoadState("domcontentloaded");
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await this.dismissCookieBannerIfPresent();
  }

  async fillSignup(data: { name: string; email: string; password: string }) {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    if (await this.confirmPasswordInput.isVisible().catch(() => false)) {
      await this.confirmPasswordInput.fill(data.password);
    }
  }

  /**
   * Fill the confirm password field explicitly. Useful for negative tests
   * like password mismatch while keeping POM usage consistent.
   */
  async fillConfirmPassword(confirmPassword: string) {
    if (await this.confirmPasswordInput.isVisible().catch(() => false)) {
      await this.confirmPasswordInput.fill(confirmPassword);
    }
  }

  async submitSignup() {
    await this.signupButton.click();
  }

  async submitSignin() {
    await this.signinButton.click();
  }

  async fillSignin(data: { email: string; password: string }) {
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
  }

  async assertOnVerificationToast() {
    const toast = this.page.locator('[data-sonner-toast]');
    await expect(toast).toContainText(/check your email/i);
  }

  async assertSignedIn(onboarding?: boolean) {
    if (onboarding) {
      await this.page.waitForURL(/welcome/);
    } else {
      await this.page.waitForURL(/dashboard|account|projects/);
      // Any signed-in indicator
      
      if (await this.signOutButton.isVisible().catch(() => false)) return;
      // Fallback to avatar/menu testids if present in app
      const userMenu = this.page.locator('[data-testid="user-menu"], [data-testid="user-avatar"]');
      await expect(userMenu.first()).toBeVisible();
    }
  }

  /**
   * Complete onboarding organization creation if on the welcome page.
   * - Generates a unique organization name/slug if not provided
   * - Fills name and ensures slug (auto-populated or manual fallback)
   * - Submits and waits to land on an authenticated area
   */
  async completeOnboardingOrganizationIfPresent(params?: {
    name?: string;
    slug?: string;
    submitTimeoutMs?: number;
  }) {
    const isWelcome = /\/auth\/welcome/.test(this.page.url());
    if (!isWelcome) return;

    const organizationName = params?.name ?? `Test Org ${nanoid(10)}`;
    const organizationSlug = (params?.slug ?? organizationName)
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // Prefer label-based selectors; fallback to name attributes for resiliency
    const nameInput = this.page.getByLabel(/name/i).first().or(this.page.locator('input[name="name"]').first());
    await nameInput.fill(organizationName);

    // Ensure slug is populated (auto or manual fallback)
    try {
      await this.page.waitForFunction(
        () => {
          const input = document.querySelector<HTMLInputElement>('input[name="slug"]');
          return Boolean(input && input.value && input.value.length > 0);
        },
        { timeout: 2000 }
      );
    } catch {
      const slugInput = this.page.getByLabel(/slug/i).first().or(this.page.locator('input[name="slug"]').first());
      await slugInput.fill(organizationSlug);
    }

    const submitTimeout = params?.submitTimeoutMs ?? 15_000;

    // Try a generic submit, with a role-based fallback for robustness
    const primarySubmit = this.page.locator('button[type="submit"]').first();
    try {
      await expect(primarySubmit).toBeEnabled({ timeout: submitTimeout });
      await primarySubmit.click();
    } catch {
      const fallbackSubmit = this.page.getByRole('button', { name: /create|continue|finish/i }).first();
      await expect(fallbackSubmit).toBeEnabled({ timeout: submitTimeout });
      await fallbackSubmit.click();
    }

    // Land on an authenticated area after onboarding
    await this.page.waitForURL(/\/account|\/dashboard|\/projects/, { timeout: 30_000 });
  }

  /**
   * Attempt to sign out if a sign out button is visible.
   * Uses resilient waiting: after clicking, waits for the button to disappear
   * or for a known auth route to be reached.
   */
  async signOutIfVisible() {
    try {
      const visible = await this.signOutButton.isVisible().catch(() => false);
      if (!visible) return;
      await this.signOutButton.click();
      // Prefer deterministic waits instead of timeouts
      await Promise.race([
        this.signOutButton.waitFor({ state: "hidden", timeout: 10_000 }),
        this.page.waitForURL(/auth\/(sign-in|signin|sign-up|signup)/, { timeout: 10_000 }).catch(() => Promise.resolve()),
      ]);
    } catch {
      // Best-effort sign out; ignore errors to keep tests flowing
    }
  }

  /**
   * Wait for the Accept Invitation card to be visible on the welcome page.
   * Uses resilient, accessibility-first selectors per testing guidelines.
   */
  async waitForAcceptInvitationCard() {
    const heading = this.page.getByText(/accept invitation/i).first();
    await expect(heading).toBeVisible({ timeout: 30_000 });
  }

  /**
   * Click the Accept button and assert the success toast appears.
   * Uses Sonner toast selectors with a fallback text match for robustness.
   */
  async acceptInvitationAndAssertToast() {
    const acceptButton = this.page.getByRole("button", { name: /accept/i });
    await expect(acceptButton).toBeVisible({ timeout: 30_000 });
    await acceptButton.click();

    const acceptedToastVariant = this.page
      .locator('[data-sonner-toast]')
      .filter({ hasText: /invitation accepted( successfully)?/i })
      .first();

    await Promise.race([
      acceptedToastVariant.waitFor({ state: "visible", timeout: 15_000 }),
      this.page
        .getByText(/invitation accepted( successfully)?/i)
        .waitFor({ state: "visible", timeout: 15_000 }),
    ]);
  }
}


