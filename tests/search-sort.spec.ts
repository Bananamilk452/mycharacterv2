import { expect, test } from "@playwright/test";

import { Helper } from "./helper";

test.describe("검색/정렬/크기 기능", () => {
  let helper: Helper;

  test.beforeEach(async ({ page }) => {
    helper = new Helper(page);
    await helper.gotoHome();
    await helper.createCollection();

    // 생성 순서: 하늘 → 가람 (기본 정렬은 생성일 오름차순)
    await helper.addCharacter({
      name: "하늘",
      tags: ["하늘태그", "공통태그"],
      properties: [{ key: "나이", value: "30" }],
    });
    await helper.addCharacter({
      name: "가람",
      tags: ["가람태그", "공통태그"],
      properties: [{ key: "나이", value: "10" }],
      relations: [{ characterName: "하늘", relationName: "친구" }],
    });
  });

  test("이름/속성/관계와 숫자 연산자로 검색할 수 있다", async ({ page }) => {
    await helper.applySearch([{ type: "이름", value: "가람" }]);
    await expect.poll(() => helper.characterNames()).toEqual(["가람"]);
    await expect(page.getByTestId("applied-search-count")).toHaveText("1개의 검색 조건 적용됨");

    await helper.applySearch([{ type: "속성", key: "나이", value: "10" }]);
    await expect.poll(() => helper.characterNames()).toEqual(["가람"]);

    await helper.applySearch([
      { type: "속성", key: "나이", operation: "보다 큰 (숫자인 경우에만)", value: "10" },
    ]);
    await expect.poll(() => helper.characterNames()).toEqual(["하늘"]);

    await helper.applySearch([
      { type: "속성", key: "나이", operation: "보다 작은 (숫자인 경우에만)", value: "20" },
    ]);
    await expect.poll(() => helper.characterNames()).toEqual(["가람"]);

    await helper.applySearch([
      { type: "속성", key: "나이", operation: "보다 크거나 같은 (숫자인 경우에만)", value: "30" },
    ]);
    await expect.poll(() => helper.characterNames()).toEqual(["하늘"]);

    await helper.applySearch([
      {
        type: "속성",
        key: "나이",
        operation: "보다 작거나 같은 (숫자인 경우에만)",
        value: "10",
      },
    ]);
    await expect.poll(() => helper.characterNames()).toEqual(["가람"]);

    await helper.applySearch([{ type: "관계", value: "친구" }]);
    await expect.poll(() => helper.characterNames()).toEqual(["가람"]);
  });

  test("태그로 검색할 수 있다", async ({ page }) => {
    await helper.applySearch([{ type: "태그", value: "하늘태그" }]);
    await expect.poll(() => helper.characterNames()).toEqual(["하늘"]);

    // 대소문자 구분 없이 검색된다.
    await helper.applySearch([{ type: "태그", value: "공통태그" }]);
    await expect.poll(() => helper.characterNames()).toEqual(["하늘", "가람"]);

    // 이름과 태그 검색을 함께 적용할 수 있다.
    await helper.applySearch([
      { type: "태그", value: "공통태그" },
      { type: "이름", value: "가람" },
    ]);
    await expect.poll(() => helper.characterNames()).toEqual(["가람"]);
    await expect(page.getByTestId("applied-search-count")).toHaveText("2개의 검색 조건 적용됨");
  });

  test("여러 검색 조건을 AND로 적용하고 초기화할 수 있다", async ({ page }) => {
    await helper.applySearch([
      { type: "이름", value: "가람" },
      { type: "속성", key: "나이", value: "10" },
    ]);
    await expect.poll(() => helper.characterNames()).toEqual(["가람"]);
    await expect(page.getByTestId("applied-search-count")).toHaveText("2개의 검색 조건 적용됨");

    await helper.applySearch([
      { type: "이름", value: "하늘" },
      { type: "속성", key: "나이", value: "10" },
    ]);
    await expect.poll(() => helper.characterNames()).toEqual([]);

    await helper.resetSearch();
    await expect.poll(() => helper.characterNames()).toEqual(["하늘", "가람"]);
    await expect(page.getByTestId("applied-search-count")).toHaveCount(0);
  });

  test("이름/생성일/수정일/속성으로 정렬할 수 있다", async () => {
    await expect.poll(() => helper.characterNames()).toEqual(["하늘", "가람"]);

    await helper.sortBy({ type: "이름", order: "오름차순" });
    await expect.poll(() => helper.characterNames()).toEqual(["가람", "하늘"]);

    await helper.sortBy({ type: "이름", order: "내림차순" });
    await expect.poll(() => helper.characterNames()).toEqual(["하늘", "가람"]);

    await helper.sortBy({ type: "생성일", order: "내림차순" });
    await expect.poll(() => helper.characterNames()).toEqual(["가람", "하늘"]);

    await helper.sortBy({ type: "수정일", order: "내림차순" });
    await expect.poll(() => helper.characterNames()).toEqual(["가람", "하늘"]);

    await helper.sortBy({ type: "속성", order: "오름차순", property: "나이" });
    await expect.poll(() => helper.characterNames()).toEqual(["가람", "하늘"]);

    await helper.sortBy({ type: "속성", order: "내림차순", property: "나이" });
    await expect.poll(() => helper.characterNames()).toEqual(["하늘", "가람"]);
  });

  test("캐릭터 크기를 조절할 수 있다", async ({ page }) => {
    const slider = page.getByRole("slider");
    const cardImage = page.locator("#characters img[alt='하늘']");

    await expect(slider).toHaveAttribute("aria-valuenow", "1");
    await expect(cardImage).toHaveClass(/size-32/);

    await slider.focus();
    await slider.press("ArrowRight");

    await expect(slider).toHaveAttribute("aria-valuenow", "2");
    await expect(cardImage).toHaveClass(/size-40/);

    await slider.press("ArrowLeft");

    await expect(slider).toHaveAttribute("aria-valuenow", "1");
    await expect(cardImage).toHaveClass(/size-32/);
  });
});
