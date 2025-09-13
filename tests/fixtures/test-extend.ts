import { test as base, type Page } from "@playwright/test";
import { AuthPage } from "../page-objects/AuthPage";

type Fx = {
  authPage: AuthPage;
};

export const test = base.extend<Fx>({
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },
});

export const expect = test.expect;


