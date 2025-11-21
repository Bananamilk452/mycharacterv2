import { test as base, Page } from "@playwright/test";

export const test = base.extend<{ homePage: Page }>({
  homePage: async ({ page }, use) => {
    await page.goto("/");
    await page.locator("[data-slot='dialog-close']").click();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },
});
