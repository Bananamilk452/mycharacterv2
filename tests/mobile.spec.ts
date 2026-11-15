import { expect, test } from "@playwright/test";

test.describe("모바일 안내", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("모바일에서 안내가 표시되고 닫으면 다시 표시되지 않는다", async ({ page }) => {
    await page.goto("/");

    const notice = page.getByTestId("mobile-notice");
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("모바일 환경 안내");
    await expect(notice).toContainText("PC 환경에 최적화");

    await page.getByTestId("mobile-notice-confirm-button").click();
    await expect(notice).toBeHidden();

    // 새로고침해도 다시 표시되지 않는다.
    await page.reload();
    await expect(page.getByTestId("mobile-notice")).toHaveCount(0);
  });

  test("모바일에서도 안내를 닫은 뒤 기존 화면을 사용할 수 있다", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("mobile-notice-confirm-button").click();

    // 영구 스토리지 안내를 닫고 기존 화면을 사용할 수 있는지 확인한다.
    const storageDialog = page.getByRole("dialog", { name: "영구 스토리지 권한 요청" });
    await expect(storageDialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(storageDialog).toBeHidden();

    await page.getByTestId("welcomemenu-create-collection").click();
    await expect(page.getByRole("dialog", { name: "콜렉션 생성" })).toBeVisible();
  });
});

test.describe("데스크톱 안내", () => {
  test("데스크톱에서는 모바일 안내가 표시되지 않는다", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("mobile-notice")).toHaveCount(0);
  });
});
