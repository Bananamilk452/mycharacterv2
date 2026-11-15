import { expect, test } from "@playwright/test";

import { TEST_AVATAR_PATH } from "./constants";
import { Helper } from "./helper";

test.describe("캐릭터 카드 기능", () => {
  let helper: Helper;

  test.beforeEach(async ({ page }) => {
    helper = new Helper(page);
    await helper.gotoHome();
    await helper.createCollection();
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

    expect(download.suggestedFilename()).toContain("카드");
    expect(download.suggestedFilename()).toMatch(/\.png$/);
    expect(await download.path()).toBeTruthy();
  });

  test("캐릭터 추가/수정 모달에서 카드 미리보기를 열 수 있다", async ({ page }) => {
    await page.getByTestId("sidebar-add-character-button").click();
    await page.getByTestId("character-modal-name-input").fill("미리보기 캐릭터");
    await page.getByTestId("tagbox-input").fill("미리보기");
    await page.getByTestId("tagbox-input").press("Enter");

    // 생성 중인 입력값으로 카드 미리보기를 연다.
    await page.getByTestId("character-modal-card-preview-button").click();
    const card = page.getByTestId("character-card-preview");
    await expect(card).toBeVisible();
    await expect(card).toContainText("미리보기 캐릭터");
    await expect(card).toContainText("#미리보기");

    // 카드만 닫히고 캐릭터 생성 모달은 유지된다.
    await page.keyboard.press("Escape");
    await expect(card).toBeHidden();
    await expect(page.getByTestId("character-modal-name-input")).toBeVisible();

    await page.getByTestId("character-modal-submit-button").click();
    await expect(helper.characterCard("미리보기 캐릭터")).toBeVisible();

    // 수정 모달에서도 현재 값으로 카드 미리보기를 열 수 있다.
    await helper.openCharacter("미리보기 캐릭터");
    await page.getByTestId("character-modal-name-input").fill("수정된 미리보기 캐릭터");
    await page.getByTestId("character-modal-card-preview-button").click();
    await expect(page.getByTestId("character-card-preview")).toContainText(
      "수정된 미리보기 캐릭터",
    );

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("character-card-preview")).toBeHidden();
    await helper.closeDialog();
  });
});
