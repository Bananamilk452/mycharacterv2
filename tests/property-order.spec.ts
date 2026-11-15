import { expect, test } from "@playwright/test";

import { Helper } from "./helper";

test.describe("속성 순서 기능", () => {
  let helper: Helper;

  test.beforeEach(async ({ page }) => {
    helper = new Helper(page);
    await helper.gotoHome();
    await helper.createCollection();
  });

  test("속성 순서를 위/아래로 변경할 수 있다", async ({ page }) => {
    await helper.addCharacter({
      name: "속성 캐릭터",
      properties: [
        { key: "키1", value: "값1" },
        { key: "키2", value: "값2" },
        { key: "키3", value: "값3" },
      ],
    });

    await helper.openCharacter("속성 캐릭터");
    await expect(page.getByTestId("propertybox-key-0")).toHaveValue("키1");
    await expect(page.getByTestId("propertybox-key-1")).toHaveValue("키2");
    await expect(page.getByTestId("propertybox-key-2")).toHaveValue("키3");

    // 첫 번째는 위로, 마지막은 아래로 이동할 수 없다.
    await expect(page.getByTestId("propertybox-move-up-0")).toBeDisabled();
    await expect(page.getByTestId("propertybox-move-down-2")).toBeDisabled();

    await page.getByTestId("propertybox-move-down-0").click();
    await expect(page.getByTestId("propertybox-key-0")).toHaveValue("키2");
    await expect(page.getByTestId("propertybox-value-0")).toHaveValue("값2");
    await expect(page.getByTestId("propertybox-key-1")).toHaveValue("키1");
    await expect(page.getByTestId("propertybox-value-1")).toHaveValue("값1");

    await page.getByTestId("propertybox-move-up-2").click();
    await expect(page.getByTestId("propertybox-key-1")).toHaveValue("키3");
    await expect(page.getByTestId("propertybox-key-2")).toHaveValue("키1");

    // 저장 후 다시 열어도 순서가 유지된다.
    await page.getByTestId("character-modal-submit-button").click();
    await expect(helper.characterCard("속성 캐릭터")).toBeVisible();

    await helper.openCharacter("속성 캐릭터");
    await expect(page.getByTestId("propertybox-key-0")).toHaveValue("키2");
    await expect(page.getByTestId("propertybox-value-0")).toHaveValue("값2");
    await expect(page.getByTestId("propertybox-key-1")).toHaveValue("키3");
    await expect(page.getByTestId("propertybox-key-2")).toHaveValue("키1");

    await helper.closeDialog();
  });
});
