import { expect, test } from "@playwright/test";

import { Helper } from "./helper";

test.describe("콜렉션 기능", () => {
  let helper: Helper;

  test.beforeEach(async ({ page }) => {
    helper = new Helper(page);
    await helper.gotoHome();
  });

  test("콜렉션 설정을 수정하고 캐릭터 설명 템플릿을 적용할 수 있다", async ({
    page,
    browserName,
  }) => {
    await helper.createCollection("원래 콜렉션");
    await helper.updateCollection({
      name: "수정된 콜렉션",
      description: "콜렉션 설명입니다.",
      characterDescription: "종족: {{종족}}",
      uploadIcon: browserName !== "webkit",
    });

    await expect(page.getByTestId("sidebar-collection-name")).toHaveText("수정된 콜렉션");

    if (browserName !== "webkit") {
      await expect(page.getByTestId("sidebar-collection-icon")).toHaveAttribute("src", /^blob:/);
    }

    // 캐릭터 설명 템플릿이 카드에 적용되는지 확인
    await helper.addCharacter({
      name: "인간 캐릭터",
      properties: [{ key: "종족", value: "인간" }],
    });
    await expect(helper.characterCard("인간 캐릭터")).toContainText("종족: 인간");

    // 템플릿에 해당하는 속성이 없으면 "-"로 표시된다.
    await helper.addCharacter({ name: "미지정 캐릭터" });
    await expect(helper.characterCard("미지정 캐릭터")).toContainText("종족: -");
    await expect(page.locator("#characters img[alt='미지정 캐릭터']")).toHaveAttribute(
      "src",
      "/default-avatar.png",
    );

    // 다시 열어서 수정 내용이 유지되는지 확인
    await page.getByTestId("sidebar-update-collection-button").click();
    await expect(page.getByTestId("collection-modal-name-input")).toHaveValue("수정된 콜렉션");
    await expect(page.getByTestId("collection-modal-description-input")).toHaveValue(
      "콜렉션 설명입니다.",
    );
    await expect(page.getByTestId("collection-modal-character-description-input")).toHaveValue(
      "종족: {{종족}}",
    );
    await helper.closeDialog();
  });

  test("콜렉션이 없으면 홈과 콜렉션 열기에서 빈 상태를 보여준다", async ({ page }) => {
    await expect(page.getByText("최근 콜렉션이 없습니다.")).toBeVisible();

    await page.getByTestId("welcomemenu-open-collection").click();
    const dialog = page.getByRole("dialog", { name: "콜렉션 열기" });
    await expect(dialog.getByText("콜렉션이 없습니다.")).toBeVisible();
  });

  test("에디터 메뉴바에서 새 콜렉션을 만들 수 있다", async ({ page }) => {
    await helper.createCollection("첫 콜렉션");
    await helper.createCollection("두번째 콜렉션", { fromEditor: true });

    await expect(page.getByTestId("sidebar-collection-name")).toHaveText("두번째 콜렉션");
    await expect(page).toHaveURL(/\/editor\/.+/);
  });

  test("최근 콜렉션과 콜렉션 열기로 다시 진입할 수 있다", async ({ page }) => {
    await helper.createCollection("최근 콜렉션");
    await helper.goHome();

    await expect(page.getByRole("link", { name: "최근 콜렉션" })).toBeVisible();

    await helper.openCollectionFromHome("최근 콜렉션");
    await expect(page.getByTestId("sidebar-collection-name")).toHaveText("최근 콜렉션");
  });

  test("새로고침해도 콜렉션과 캐릭터 데이터가 유지된다", async ({ page }) => {
    await helper.createCollection("영속 콜렉션");
    await helper.addCharacter({
      name: "영속 캐릭터",
      tags: ["영속 태그"],
      properties: [{ key: "영속 키", value: "영속 값" }],
      note: "영속 메모",
    });

    await page.reload();

    await expect(page.getByTestId("sidebar-collection-name")).toHaveText("영속 콜렉션");
    await expect(helper.characterCard("영속 캐릭터")).toBeVisible();

    await helper.openCharacter("영속 캐릭터");
    await expect(page.getByTestId("tagbox-tag-0")).toHaveText("영속 태그");
    await expect(page.getByTestId("propertybox-key-0")).toHaveValue("영속 키");
    await expect(page.getByTestId("propertybox-value-0")).toHaveValue("영속 값");
    await expect(page.frameLocator("iframe.tox-edit-area__iframe").locator("body")).toContainText(
      "영속 메모",
    );
  });

  test("콜렉션을 내보내고 다른 컨텍스트에서 가져올 수 있다", async ({
    browser,
    baseURL,
    browserName,
  }) => {
    await helper.createCollection("내보내기 콜렉션");
    await helper.addCharacter({
      name: "내보내기 캐릭터",
      uploadAvatar: browserName !== "webkit",
      tags: ["내보내기 태그"],
      properties: [{ key: "내보내기 키", value: "내보내기 값" }],
    });

    const zipPath = await helper.exportCollection();

    // 같은 컨텍스트에는 원본 콜렉션이 이미 있으므로 새 컨텍스트에서 가져온다.
    const importContext = await browser.newContext({ baseURL });
    try {
      const importPage = await importContext.newPage();
      const importHelper = new Helper(importPage);

      await importHelper.gotoHome();
      await importHelper.importCollection(zipPath);

      await expect(importPage.getByTestId("sidebar-collection-name")).toHaveText("내보내기 콜렉션");
      await expect(importHelper.characterCard("내보내기 캐릭터")).toBeVisible();

      await importHelper.openCharacter("내보내기 캐릭터");
      await expect(importPage.getByTestId("tagbox-tag-0")).toHaveText("내보내기 태그");
      await expect(importPage.getByTestId("propertybox-key-0")).toHaveValue("내보내기 키");
      await expect(importPage.getByTestId("propertybox-value-0")).toHaveValue("내보내기 값");

      if (browserName !== "webkit") {
        await expect(importPage.getByTestId("image-upload-preview")).toHaveAttribute(
          "src",
          /^blob:/,
        );
      }
    } finally {
      await importContext.close();
    }
  });

  test("메뉴바에서 콜렉션 열기/내보내기/가져오기와 홈 이동을 사용할 수 있다", async ({ page }) => {
    await helper.createCollection("메뉴 콜렉션");

    await helper.clickMenubar("menubar-open-collection");
    await expect(page.getByRole("dialog", { name: "콜렉션 열기" })).toBeVisible();
    await helper.closeDialog();

    await helper.clickMenubar("menubar-export-collection");
    await expect(page.getByRole("dialog", { name: "콜렉션 내보내기" })).toBeVisible();
    await helper.closeDialog();

    await helper.clickMenubar("menubar-import-collection");
    await expect(page.getByRole("dialog", { name: "콜렉션 가져오기" })).toBeVisible();
    await helper.closeDialog();

    await helper.goHome();
    await expect(page.getByTestId("welcomemenu-create-collection")).toBeVisible();
  });
});
