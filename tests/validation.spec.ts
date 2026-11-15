import { expect, test } from "@playwright/test";
import JSZip from "jszip";

import { Helper } from "./helper";

test.describe("검증/에러 처리", () => {
  let helper: Helper;

  test.beforeEach(async ({ page }) => {
    helper = new Helper(page);
    await helper.gotoHome();
  });

  test("빈 콜렉션 이름으로 생성할 수 없다", async ({ page }) => {
    await page.getByTestId("welcomemenu-create-collection").click();
    await page.getByTestId("create-collection-submit-button").click();

    await expect(page.getByText("최소 1글자 이상 입력해주세요.")).toBeVisible();
    await expect(page.getByRole("dialog", { name: "콜렉션 생성" })).toBeVisible();
  });

  test("빈 캐릭터 이름으로 생성할 수 없다", async ({ page }) => {
    await helper.createCollection();
    await page.getByTestId("sidebar-add-character-button").click();
    await page.getByTestId("character-modal-submit-button").click();

    await expect(page.getByText("최소 1글자 이상 입력해주세요.")).toBeVisible();
    await expect(page.getByTestId("character-modal-name-input")).toBeVisible();
  });

  test("속성 이름과 값이 비어 있으면 저장할 수 없다", async ({ page }) => {
    await helper.createCollection();
    await page.getByTestId("sidebar-add-character-button").click();
    await page.getByTestId("character-modal-name-input").fill("속성 검증");
    await page.getByTestId("propertybox-add-button").click();
    await page.getByTestId("character-modal-submit-button").click();

    await expect(page.getByText("최소 1글자 이상 입력해주세요.").first()).toBeVisible();
    await expect(page.getByTestId("character-modal-name-input")).toBeVisible();
  });

  test("속성 정렬은 속성 이름이 필요하다", async ({ page }) => {
    await helper.createCollection();
    await page.getByTestId("sort-open-button").click();
    await page.getByTestId("sort-type-select").click();
    await page.getByRole("option", { name: "속성", exact: true }).click();
    await page.getByTestId("sort-submit-button").click();

    await expect(page.getByText("속성 이름을 입력해주세요.")).toBeVisible();
    await expect(page.getByRole("dialog", { name: "정렬" })).toBeVisible();
  });

  test("숫자 연산자에 숫자가 아닌 값을 넣으면 경고한다", async ({ page }) => {
    await helper.createCollection();
    await page.getByTestId("advanced-search-open-button").click();
    await page.getByTestId("advanced-search-type-select").click();
    await page.getByRole("option", { name: "속성", exact: true }).click();
    await page.getByTestId("advanced-search-operation-select").click();
    await page.getByRole("option", { name: "보다 큰 (숫자인 경우에만)", exact: true }).click();
    await page.getByTestId("advanced-search-key-input").fill("나이");
    await page.getByTestId("advanced-search-value-input").fill("숫자 아님");

    const dialogPromise = page.waitForEvent("dialog");
    const clickPromise = page.getByTestId("advanced-search-add-button").click();
    const alert = await dialogPromise;

    expect(alert.message()).toBe("숫자 연산자는 숫자 값에만 사용할 수 있습니다.");
    await alert.dismiss();
    await clickPromise;
  });

  test("잘못된 ZIP 파일은 가져올 수 없다", async ({ page }) => {
    const zip = new JSZip();
    zip.file("dummy.txt", "not a collection");
    const buffer = await zip.generateAsync({ type: "nodebuffer" });

    await page.getByTestId("welcomemenu-import-collection").click();
    await page.getByTestId("import-collection-file-input").setInputFiles({
      name: "invalid.zip",
      mimeType: "application/zip",
      buffer,
    });
    await page.getByTestId("import-collection-submit-button").click();

    await expect(page.getByText("잘못된 파일 형식입니다.")).toBeVisible();
    await expect(page.getByRole("dialog", { name: "콜렉션 가져오기" })).toBeVisible();
  });

  test("존재하지 않는 콜렉션으로 이동하면 에러 화면이 표시된다", async ({ page }) => {
    await page.goto("/editor/does-not-exist");

    const alert = page.getByRole("alert");
    await expect(alert).toContainText("에러가 발생했어요:");
    await expect(alert).toContainText("콜렉션이 존재하지 않습니다.");
  });

  test("영구 스토리지 권한을 요청할 수 있다", async ({ page }) => {
    // beforeEach에서 다이얼로그를 닫았으므로 새로 열어서 확인한다.
    await page.goto("/");

    await expect(page.getByRole("dialog", { name: "영구 스토리지 권한 요청" })).toBeVisible();
    await page.getByTestId("request-persistent-storage").click();

    const result = page
      .getByText("영구 스토리지 권한이 허용되었습니다.")
      .or(page.getByText(/영구 스토리지 권한 요청에 실패했습니다/));
    await expect(result).toBeVisible();
  });
});
