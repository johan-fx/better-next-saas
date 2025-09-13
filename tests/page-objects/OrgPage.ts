import { Page, Locator, expect } from "@playwright/test";

/**
 * OrgPage (POM)
 * - Organization and members interactions
 */
export class OrgPage {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  // Members
  get inviteMemberButton() {
    return this.page.getByRole("button", { name: /invite member/i });
  }
  get inviteEmailInput() {
    return this.page.getByRole("textbox", { name: /email/i });
  }
  get sendInvitationButton() {
    return this.page.getByRole("button", { name: /send invitation/i });
  }

  async gotoMembers() {
    await this.page.goto("/account/organization/members");
    await expect(this.page).toHaveURL(/organization\/members/);
  }

  async inviteMember(email: string) {
    await expect(this.inviteMemberButton).toBeVisible();
    await this.inviteMemberButton.click();
    await this.inviteEmailInput.fill(email);
    await this.sendInvitationButton.click();

    const sentToast = this.page
      .locator('[data-sonner-toast]')
      .filter({ hasText: /invitation sent/i })
      .first();
    await expect(sentToast).toBeVisible();
  }
}


