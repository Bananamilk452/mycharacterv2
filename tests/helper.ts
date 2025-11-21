import { expect, Page } from "@playwright/test";

import { TEST_COLLECTION_NAME } from "./constants";

export class Helper {
  constructor(public readonly page: Page) {}

  async closePersistentPermissionDialog() {
    await this.page.locator("[data-slot='dialog-close']").click();
  }

  async createCollection() {
    if (
      await this.page.getByTestId("welcomemenu-create-collection").isVisible()
    ) {
      await this.page.getByTestId("welcomemenu-create-collection").click();
    } else if (
      await this.page.getByTestId("menubar-create-collection").isVisible()
    ) {
      await this.page.getByTestId("menubar-create-collection").click();
    }

    await this.page
      .getByTestId("create-collection-name-input")
      .fill(TEST_COLLECTION_NAME);
    await this.page.getByTestId("create-collection-submit-button").click();

    await this.page.getByTestId("sidebar-collection-name").waitFor();
    await expect(this.page.getByTestId("sidebar-collection-name")).toHaveText(
      TEST_COLLECTION_NAME,
    );
  }
}
