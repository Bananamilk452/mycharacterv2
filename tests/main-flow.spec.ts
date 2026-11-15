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

  test("2. 캐릭터 생성", async ({ browserName }) => {
    const helper = new Helper(page);

    // Playwright의 WebKit은 임시(ephemeral) 세션이라 IndexedDB에 Blob을 저장할 수 없다.
    // 아바타 저장은 지원되는 브라우저에서만 검증한다.
    // https://github.com/microsoft/playwright/issues/42795
    await helper.createCharacter({ uploadAvatar: browserName !== "webkit" });
  });

  test("3. 캐릭터 수정", async () => {
    const helper = new Helper(page);

    await helper.editCharacter();
  });
});
