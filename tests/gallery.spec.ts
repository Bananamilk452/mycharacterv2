import { expect, test } from "@playwright/test";

import { TEST_AVATAR_PATH } from "./constants";
import { Helper } from "./helper";

test.describe("갤러리 기능", () => {
  let helper: Helper;

  test.beforeEach(async ({ page }) => {
    helper = new Helper(page);
    await helper.gotoHome();
    await helper.createCollection();
  });

  test("콜렉션 갤러리에 이미지를 추가하고 삭제할 수 있다", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "WebKit 임시 세션에서는 IndexedDB Blob 저장이 지원되지 않습니다.");

    await page.getByTestId("sidebar-gallery-button").click();
    const gallery = page.getByTestId("collection-gallery");
    await expect(gallery).toBeVisible();
    await expect(page.getByTestId("collection-gallery-empty")).toBeVisible();

    await page.getByTestId("collection-gallery-upload-input").setInputFiles(TEST_AVATAR_PATH);
    await expect(page.getByTestId("collection-gallery-image-0")).toBeVisible();
    await expect(page.getByTestId("collection-gallery-empty")).toHaveCount(0);

    // 이미지를 크게 볼 수 있다.
    await page.getByTestId("collection-gallery-image-0").click();
    await expect(page.getByTestId("gallery-lightbox-image")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("gallery-lightbox-image")).toBeHidden();

    // 새로고침 후에도 유지된다.
    await page.reload();
    const closeButton = page.locator("[data-slot='dialog-close']").first();
    if ((await closeButton.count()) > 0) {
      await closeButton.click();
    }
    await page.getByTestId("sidebar-gallery-button").click();
    await expect(page.getByTestId("collection-gallery-image-0")).toBeVisible();

    // 삭제할 수 있다.
    await page.getByTestId("collection-gallery-delete-0").click();
    await expect(page.getByTestId("collection-gallery-image-0")).toHaveCount(0);
    await expect(page.getByTestId("collection-gallery-empty")).toBeVisible();
  });

  test("캐릭터 갤러리에 이미지를 추가하고 삭제할 수 있다", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "WebKit 임시 세션에서는 IndexedDB Blob 저장이 지원되지 않습니다.");

    await helper.addCharacter({ name: "갤러리 캐릭터" });
    await helper.openCharacter("갤러리 캐릭터");

    await expect(page.getByTestId("character-gallery-empty")).toBeVisible();
    await page.getByTestId("character-gallery-upload-input").setInputFiles(TEST_AVATAR_PATH);
    await expect(page.getByTestId("character-gallery-image-0")).toBeVisible();

    // 다시 열어도 유지된다.
    await helper.closeDialog();
    await helper.openCharacter("갤러리 캐릭터");
    await expect(page.getByTestId("character-gallery-image-0")).toBeVisible();

    await page.getByTestId("character-gallery-delete-0").click();
    await expect(page.getByTestId("character-gallery-image-0")).toHaveCount(0);
    await expect(page.getByTestId("character-gallery-empty")).toBeVisible();

    await helper.closeDialog();
  });

  test("새 캐릭터 생성 중에는 갤러리 안내를 보여준다", async ({ page }) => {
    await page.getByTestId("sidebar-add-character-button").click();
    await expect(page.getByText("캐릭터를 저장한 뒤 갤러리에 사진을 추가할 수 있습니다.")).toBeVisible();
    await helper.closeDialog();
  });

  test("콜렉션 갤러리 이미지가 내보내기/가져오기에 포함된다", async ({
    page,
    browser,
    baseURL,
    browserName,
  }) => {
    test.skip(browserName === "webkit", "WebKit 임시 세션에서는 IndexedDB Blob 저장이 지원되지 않습니다.");

    await page.getByTestId("sidebar-gallery-button").click();
    await page.getByTestId("collection-gallery-upload-input").setInputFiles(TEST_AVATAR_PATH);
    await expect(page.getByTestId("collection-gallery-image-0")).toBeVisible();

    const zipPath = await helper.exportCollection();

    const importContext = await browser.newContext({ baseURL });
    try {
      const importPage = await importContext.newPage();
      const importHelper = new Helper(importPage);

      await importHelper.gotoHome();
      await importHelper.importCollection(zipPath);
      await expect(importPage.getByTestId("sidebar-collection-name")).toHaveText(
        "테스트 콜렉션",
      );

      await importPage.getByTestId("sidebar-gallery-button").click();
      await expect(importPage.getByTestId("collection-gallery-image-0")).toBeVisible();
    } finally {
      await importContext.close();
    }
  });
});
