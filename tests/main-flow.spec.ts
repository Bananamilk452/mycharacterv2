import test, { Page } from "@playwright/test";

import { Helper } from "./helper";

test.describe.serial("메인 플로우", async () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    const helper = new Helper(page);
    await page.goto("/");
    await helper.closeDialog();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("1. 콜렉션 생성", async () => {
    const helper = new Helper(page);

    await helper.createCollection();
  });

  test("2. 캐릭터 생성", async () => {
    const helper = new Helper(page);

    await helper.createCharacter();
  });

  test("3. 캐릭터 수정", async () => {
    const helper = new Helper(page);

    await helper.editCharacter();
  });
});
