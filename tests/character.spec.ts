import { expect, test } from "@playwright/test";

import { TEST_AVATAR_PATH } from "./constants";
import { Helper } from "./helper";

test.describe("캐릭터 기능", () => {
  let helper: Helper;

  test.beforeEach(async ({ page }) => {
    helper = new Helper(page);
    await helper.gotoHome();
    await helper.createCollection();
  });

  test("컨텍스트 메뉴로 캐릭터를 수정할 수 있다", async ({ page }) => {
    await helper.addCharacter({ name: "메뉴 캐릭터" });

    await helper.openCharacterContextMenu("메뉴 캐릭터", "edit");
    await expect(page.getByTestId("character-modal-name-input")).toHaveValue("메뉴 캐릭터");

    await page.getByTestId("character-modal-name-input").fill("수정된 메뉴 캐릭터");
    await page.getByTestId("character-modal-submit-button").click();

    await expect(helper.characterCard("수정된 메뉴 캐릭터")).toBeVisible();
    await expect(helper.characterCard("메뉴 캐릭터")).toHaveCount(0);
  });

  test("캐릭터를 삭제할 수 있다", async ({ page }) => {
    await helper.addCharacter({ name: "삭제할 캐릭터" });

    await helper.deleteCharacter("삭제할 캐릭터");

    await expect(helper.characterCard("삭제할 캐릭터")).toHaveCount(0);
    await expect(page.getByText("캐릭터가 삭제되었습니다.")).toBeVisible();
  });

  test("중복된 태그는 추가되지 않는다", async ({ page }) => {
    await helper.addCharacter({ name: "태그 캐릭터", tags: ["중복 태그", "중복 태그"] });

    await helper.openCharacter("태그 캐릭터");
    await expect(page.getByTestId("tagbox-tag-0")).toHaveText("중복 태그");
    await expect(page.getByTestId("tagbox-tag-1")).toHaveCount(0);
  });

  test("관계를 추가하고 삭제할 수 있다", async ({ page }) => {
    await helper.addCharacter({ name: "가온" });
    await helper.addCharacter({
      name: "나래",
      relations: [{ characterName: "가온", relationName: "친구" }],
    });

    await helper.openCharacter("나래");
    await expect(page.getByTestId("relationbox-character-card-0")).toContainText("가온");
    await expect(page.getByTestId("relationbox-character-card-0")).toContainText("친구");

    // 두 번째 관계 추가 (캐릭터와 관계명을 모두 입력해야 활성화)
    await page.getByTestId("relationbox-add-button").click();
    const dialog = page.getByRole("dialog", { name: "관계 추가" });
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId("add-relation-modal-submit-button")).toBeDisabled();

    await dialog.getByRole("button").filter({ hasText: "가온" }).click();
    await expect(page.getByTestId("add-relation-modal-submit-button")).toBeDisabled();

    await page.getByTestId("add-relation-modal-relation-name-input").fill("라이벌");
    await expect(page.getByTestId("add-relation-modal-submit-button")).toBeEnabled();
    await page.getByTestId("add-relation-modal-submit-button").click();
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId("relationbox-character-card-1")).toContainText("라이벌");

    // 첫 번째 관계 삭제
    await page.getByTestId("relationbox-character-card-0").click({ button: "right" });
    await page.getByTestId("relation-context-menu-delete").click();
    await expect(page.getByTestId("relationbox-character-card-0")).toContainText("라이벌");
    await expect(page.getByTestId("relationbox-character-card-1")).toHaveCount(0);

    // 저장 후 다시 열어서 삭제가 반영되었는지 확인
    await page.getByTestId("character-modal-submit-button").click();
    await expect(helper.characterCard("나래")).toBeVisible();

    await helper.openCharacter("나래");
    await expect(page.getByTestId("relationbox-character-card-0")).toContainText("라이벌");
    await expect(page.getByTestId("relationbox-character-card-0")).not.toContainText("친구");
    await expect(page.getByTestId("relationbox-character-card-1")).toHaveCount(0);
  });

  test("캐릭터 카드를 확인하고 PNG로 저장할 수 있다", async ({ page }) => {
    await helper.addCharacter({ name: "친구 캐릭터" });
    await helper.updateCollection({ characterDescription: "종족: {{종족}}" });
    await helper.addCharacter({
      name: "카드 캐릭터",
      tags: ["판타지"],
      properties: [{ key: "종족", value: "인간" }],
      note: "카드 노트입니다.",
      relations: [{ characterName: "친구 캐릭터", relationName: "친구" }],
    });

    await helper.openCharacterContextMenu("카드 캐릭터", "card");

    const card = page.getByTestId("character-card-preview");
    await expect(card).toBeVisible();
    await expect(card).toContainText("카드 캐릭터");
    await expect(card).toContainText("종족: 인간");
    await expect(card).toContainText("#판타지");
    await expect(card).toContainText("친구 캐릭터 · 친구");
    await expect(card).toContainText("카드 노트입니다.");
    await expect(card).toHaveAttribute("data-background-type", "color");

    // 배경색을 변경할 수 있다.
    await page.getByTestId("character-card-color-1").click();
    await expect(card).toHaveCSS("background-color", "rgb(109, 40, 217)");
    await expect(card).toHaveAttribute("data-background-type", "color");

    // 배경 이미지를 넣고 제거할 수 있다.
    await page.getByTestId("character-card-background-input").setInputFiles(TEST_AVATAR_PATH);
    await expect(card).toHaveAttribute("data-background-type", "image");

    await page.getByTestId("character-card-background-remove").click();
    await expect(card).toHaveAttribute("data-background-type", "color");

    // PNG로 저장할 수 있다.
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("character-card-save-button").click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("카드 캐릭터-카드.png");
    expect(await download.path()).toBeTruthy();
  });
});
