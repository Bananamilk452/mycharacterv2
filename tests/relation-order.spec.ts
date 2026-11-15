import { expect, test } from "@playwright/test";

import { Helper } from "./helper";

test.describe("관계 순서 기능", () => {
  let helper: Helper;

  test.beforeEach(async ({ page }) => {
    helper = new Helper(page);
    await helper.gotoHome();
    await helper.createCollection();
  });

  test("관계 순서를 위/아래로 변경할 수 있다", async ({ page }) => {
    await helper.addCharacter({ name: "가온" });
    await helper.addCharacter({ name: "나래" });
    await helper.addCharacter({
      name: "하람",
      relations: [
        { characterName: "가온", relationName: "친구" },
        { characterName: "나래", relationName: "라이벌" },
      ],
    });

    await helper.openCharacter("하람");
    await expect(page.getByTestId("relationbox-character-card-0")).toContainText("친구");
    await expect(page.getByTestId("relationbox-character-card-1")).toContainText("라이벌");

    // 첫 번째는 위로, 마지막은 아래로 이동할 수 없다.
    await expect(page.getByTestId("relationbox-move-up-0")).toBeDisabled();
    await expect(page.getByTestId("relationbox-move-down-1")).toBeDisabled();

    await page.getByTestId("relationbox-move-up-1").click();
    await expect(page.getByTestId("relationbox-character-card-0")).toContainText("라이벌");
    await expect(page.getByTestId("relationbox-character-card-1")).toContainText("친구");

    // 저장 후 다시 열어도 순서가 유지된다.
    await page.getByTestId("character-modal-submit-button").click();
    await expect(helper.characterCard("하람")).toBeVisible();

    await helper.openCharacter("하람");
    await expect(page.getByTestId("relationbox-character-card-0")).toContainText("라이벌");
    await expect(page.getByTestId("relationbox-character-card-1")).toContainText("친구");

    await page.getByTestId("relationbox-move-down-0").click();
    await expect(page.getByTestId("relationbox-character-card-0")).toContainText("친구");
    await expect(page.getByTestId("relationbox-character-card-1")).toContainText("라이벌");

    await helper.closeDialog();
  });
});
