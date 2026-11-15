import { expect, type Locator, Page } from "@playwright/test";

import {
  EDITED_CHARACTER_NAME,
  EDITED_MEMO,
  TEST_AVATAR_PATH,
  TEST_CHARACTER_NAME,
  TEST_COLLECTION_NAME,
  TEST_MEMO,
} from "./constants";

export interface CharacterOptions {
  name: string;
  uploadAvatar?: boolean;
  tags?: string[];
  properties?: { key: string; value: string }[];
  note?: string;
  relations?: { characterName: string; relationName: string }[];
}

export interface SearchParamInput {
  type: "이름" | "속성" | "관계" | "태그";
  operation?: string;
  key?: string;
  value: string;
}

export interface SortInput {
  type: "이름" | "생성일" | "수정일" | "속성";
  order: "오름차순" | "내림차순";
  property?: string;
}

export class Helper {
  constructor(public readonly page: Page) {}

  async closeDialog() {
    await this.page.locator("[data-slot='dialog-close']").first().click();
  }

  async gotoHome() {
    await this.page.goto("/");
    await this.closeDialog();
  }

  async goHome() {
    await this.clickMenubar("menubar-home");
    await expect(this.page.getByTestId("welcomemenu-create-collection")).toBeVisible();
    await this.closeDialog();
  }

  async openMenubar() {
    const menu = this.page.getByRole("menu", { name: "파일" });
    const trigger = this.page.getByRole("menuitem", { name: "파일" });

    // 모달이 닫히는 중이면 첫 클릭이 무시될 수 있으므로 메뉴가 열릴 때까지 재시도한다.
    for (let attempt = 0; attempt < 3; attempt++) {
      await trigger.click();

      try {
        await expect(menu).toBeVisible({ timeout: 2000 });
        return;
      } catch {
        // 메뉴가 열리지 않았으면 다시 시도한다.
      }
    }

    await expect(menu).toBeVisible();
  }

  async clickMenubar(testId: string) {
    await this.openMenubar();
    await this.page.getByTestId(testId).click();
  }

  async createCollection(
    name: string = TEST_COLLECTION_NAME,
    { fromEditor = false }: { fromEditor?: boolean } = {},
  ) {
    if (fromEditor) {
      await this.clickMenubar("menubar-create-collection");
    } else {
      await this.page.getByTestId("welcomemenu-create-collection").click();
    }

    await this.page.getByTestId("create-collection-name-input").fill(name);
    await this.page.getByTestId("create-collection-submit-button").click();

    await expect(this.page.getByTestId("sidebar-collection-name")).toHaveText(name);
  }

  async updateCollection({
    name,
    description,
    characterDescription,
    uploadIcon = false,
  }: {
    name?: string;
    description?: string;
    characterDescription?: string;
    uploadIcon?: boolean;
  }) {
    await this.page.getByTestId("sidebar-update-collection-button").click();

    const dialog = this.page.getByRole("dialog", { name: "콜렉션 수정" });
    await expect(dialog).toBeVisible();

    if (name !== undefined) {
      await this.page.getByTestId("collection-modal-name-input").fill(name);
    }
    if (description !== undefined) {
      await this.page.getByTestId("collection-modal-description-input").fill(description);
    }
    if (characterDescription !== undefined) {
      await this.page
        .getByTestId("collection-modal-character-description-input")
        .fill(characterDescription);
    }
    if (uploadIcon) {
      await this.uploadImage();
    }

    await this.page.getByTestId("collection-modal-submit-button").click();
    await expect(dialog).toBeHidden();
  }

  async exportCollection() {
    await this.clickMenubar("menubar-export-collection");

    const dialog = this.page.getByRole("dialog", { name: "콜렉션 내보내기" });
    await expect(dialog).toBeVisible();

    const downloadPromise = this.page.waitForEvent("download");
    await this.page.getByTestId("export-collection-submit-button").click();
    const download = await downloadPromise;
    const path = await download.path();

    expect(path).toBeTruthy();
    await expect(dialog).toBeHidden();

    return path!;
  }

  async importCollection(filePath: string, { fromHome = true }: { fromHome?: boolean } = {}) {
    if (fromHome) {
      await this.page.getByTestId("welcomemenu-import-collection").click();
    } else {
      await this.clickMenubar("menubar-import-collection");
    }

    const dialog = this.page.getByRole("dialog", { name: "콜렉션 가져오기" });
    await expect(dialog).toBeVisible();

    await this.page.getByTestId("import-collection-file-input").setInputFiles(filePath);
    await this.page.getByTestId("import-collection-submit-button").click();

    await expect(dialog).toBeHidden();
  }

  async openCollectionFromHome(name: string) {
    await this.page.getByTestId("welcomemenu-open-collection").click();

    const dialog = this.page.getByRole("dialog", { name: "콜렉션 열기" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("link", { name }).click();

    await expect(this.page.getByTestId("sidebar-collection-name")).toHaveText(name);
  }

  characterCard(name: string) {
    return this.page
      .locator("#characters button")
      .filter({ has: this.page.getByText(name, { exact: true }) });
  }

  async characterNames() {
    return await this.page.locator("#characters h2").allTextContents();
  }

  async openCharacter(name: string) {
    await this.characterCard(name).click();
    await expect(this.page.getByTestId("character-modal-name-input")).toHaveValue(name);
  }

  async openCharacterContextMenu(name: string, action: "edit" | "delete") {
    await this.characterCard(name).click({ button: "right" });
    await this.page
      .getByTestId(
        action === "edit" ? "character-context-menu-edit" : "character-context-menu-delete",
      )
      .click();
  }

  async deleteCharacter(name: string) {
    await this.openCharacterContextMenu(name, "delete");

    const dialog = this.page.getByRole("dialog", { name: "캐릭터 삭제" });
    await expect(dialog).toBeVisible();
    await this.page.getByTestId("delete-character-submit-button").click();
    await expect(dialog).toBeHidden();
  }

  async applySearch(params: SearchParamInput[]) {
    await this.page.getByTestId("advanced-search-open-button").click();

    const dialog = this.page.getByRole("dialog", { name: "고급 검색" });
    await expect(dialog).toBeVisible();

    // 이전에 적용한 검색 조건이 남아 있을 수 있으므로 초기화한다.
    await this.page.getByTestId("advanced-search-reset-button").click();

    for (const param of params) {
      await this.page.getByTestId("advanced-search-type-select").click();
      await this.page.getByRole("option", { name: param.type, exact: true }).click();

      if (param.type === "속성") {
        await this.page.getByTestId("advanced-search-operation-select").click();
        await this.page
          .getByRole("option", { name: param.operation ?? "완전히 일치", exact: true })
          .click();
        await this.page.getByTestId("advanced-search-key-input").fill(param.key!);
        await this.page.getByTestId("advanced-search-value-input").fill(param.value);
      } else {
        await this.page.getByTestId("advanced-search-key-input").fill(param.value);
      }

      await this.page.getByTestId("advanced-search-add-button").click();
    }

    await this.page.getByTestId("advanced-search-submit-button").click();
    await expect(dialog).toBeHidden();
  }

  async resetSearch() {
    await this.page.getByTestId("advanced-search-open-button").click();

    const dialog = this.page.getByRole("dialog", { name: "고급 검색" });
    await expect(dialog).toBeVisible();

    // 조건을 하나 추가한 뒤 초기화하는 흐름까지 확인한다.
    await this.page.getByTestId("advanced-search-type-select").click();
    await this.page.getByRole("option", { name: "이름", exact: true }).click();
    await this.page.getByTestId("advanced-search-key-input").fill("초기화");
    await this.page.getByTestId("advanced-search-add-button").click();
    await this.page.getByTestId("advanced-search-reset-button").click();

    await this.page.getByTestId("advanced-search-submit-button").click();
    await expect(dialog).toBeHidden();
  }

  async sortBy({ type, order, property }: SortInput) {
    await this.page.getByTestId("sort-open-button").click();

    const dialog = this.page.getByRole("dialog", { name: "정렬" });
    await expect(dialog).toBeVisible();

    await this.page.getByTestId("sort-type-select").click();
    await this.page.getByRole("option", { name: type, exact: true }).click();

    await this.page.getByTestId("sort-order-select").click();
    await this.page.getByRole("option", { name: order, exact: true }).click();

    if (type === "속성") {
      await this.page.getByTestId("sort-property-input").fill(property!);
    }

    await this.page.getByTestId("sort-submit-button").click();
    await expect(dialog).toBeHidden();
  }

  async createCharacter({ uploadAvatar = true }: { uploadAvatar?: boolean } = {}) {
    await this.page.getByTestId("sidebar-add-character-button").click();

    // 캐릭터 이름 입력
    await this.page.getByTestId("character-modal-name-input").fill(TEST_CHARACTER_NAME);

    // 캐릭터 이미지 업로드 (이미지 제거/재업로드, 비율 변경 포함)
    if (uploadAvatar) {
      await this.uploadImage({ aspect: "자유" });

      // 이미지 제거 기능 작동하는지 확인
      await this.removeImage();

      // 다시 이미지 업로드
      await this.uploadImage({ aspect: "1:1" });
    }

    // 태그 기능 작동하는지 확인
    await this.page.getByTestId("tagbox-input").fill("태그1");
    await this.page.getByTestId("tagbox-input").press("Enter");
    await expect(this.page.getByTestId("tagbox-tag-0")).toHaveText("태그1");

    // 태그 하나 더 추가
    await this.page.getByTestId("tagbox-input").fill("태그2");
    await this.page.getByTestId("tagbox-input").press(" ");
    await expect(this.page.getByTestId("tagbox-tag-1")).toHaveText("태그2");

    // 태그 제거 기능 작동하는지 확인
    await this.page.getByTestId("tagbox-tag-remove-0").click();
    await expect(this.page.getByTestId("tagbox-tag-0")).toHaveText("태그2");

    // 속성 기능 작동하는지 확인
    await this.page.getByTestId("propertybox-add-button").click();
    await this.page.getByTestId("propertybox-key-0").fill("속성키1");
    await this.page.getByTestId("propertybox-value-0").fill("속성값1");

    // 속성 하나 더 추가
    await this.page.getByTestId("propertybox-add-button").click();
    await this.page.getByTestId("propertybox-key-1").fill("속성키2");
    await this.page.getByTestId("propertybox-value-1").fill("속성값2");

    // 속성 제거 기능 작동하는지 확인
    await this.page.getByTestId("propertybox-remove-button-0").click();
    await expect(this.page.getByTestId("propertybox-key-0")).toHaveValue("속성키2");
    await expect(this.page.getByTestId("propertybox-value-0")).toHaveValue("속성값2");

    // TinyMCE 에디터 로딩 대기
    await this.page.waitForSelector("iframe.tox-edit-area__iframe");

    // 설명 입력
    const frameHandle = await this.page.$("iframe.tox-edit-area__iframe");
    const frame = await frameHandle!.contentFrame();
    await frame!.fill("body", TEST_MEMO);

    // 캐릭터 생성
    await this.page.getByTestId("character-modal-submit-button").click();

    // 캐릭터 생성 확인
    await expect(this.page.getByTestId("character-card-0")).toHaveText(TEST_CHARACTER_NAME);

    // 업로드한 아바타가 카드에 표시되는지 확인
    if (uploadAvatar) {
      await expect(
        this.page.locator(`#characters img[alt='${TEST_CHARACTER_NAME}']`),
      ).toHaveAttribute("src", /^blob:/);
    }

    // 다시 캐릭터 모달 열어서 내용 확인
    await this.page.getByTestId("character-card-0").click();

    // 캐릭터 이름 확인
    await expect(this.page.getByTestId("character-modal-name-input")).toHaveValue(
      TEST_CHARACTER_NAME,
    );

    // 캐릭터 이미지 확인
    if (uploadAvatar) {
      const modalImageSrc = await this.page.getByTestId("image-upload-preview").getAttribute("src");
      expect(modalImageSrc).toBeTruthy();
    }

    // 태그 확인
    await expect(this.page.getByTestId("tagbox-tag-0")).toHaveText("태그2");

    // 속성 확인
    await expect(this.page.getByTestId("propertybox-key-0")).toHaveValue("속성키2");
    await expect(this.page.getByTestId("propertybox-value-0")).toHaveValue("속성값2");

    // 메모 확인
    const frameHandle2 = await this.page.$("iframe.tox-edit-area__iframe");
    const frame2 = await frameHandle2!.contentFrame();
    const memoContent = await frame2!.$eval("body", (el) => el.innerHTML);
    await expect(memoContent).toContain(TEST_MEMO);

    // 닫기
    await this.closeDialog();
  }

  async addCharacter({
    name,
    uploadAvatar = false,
    tags = [],
    properties = [],
    note,
    relations = [],
  }: CharacterOptions) {
    await this.page.getByTestId("sidebar-add-character-button").click();
    await this.page.getByTestId("character-modal-name-input").fill(name);

    if (uploadAvatar) {
      await this.uploadImage();
    }

    for (const tag of tags) {
      await this.page.getByTestId("tagbox-input").fill(tag);
      await this.page.getByTestId("tagbox-input").press("Enter");
    }

    for (let i = 0; i < properties.length; i++) {
      await this.page.getByTestId("propertybox-add-button").click();
      await this.page.getByTestId(`propertybox-key-${i}`).fill(properties[i].key);
      await this.page.getByTestId(`propertybox-value-${i}`).fill(properties[i].value);
    }

    if (note !== undefined) {
      await this.page.waitForSelector("iframe.tox-edit-area__iframe");
      const frameHandle = await this.page.$("iframe.tox-edit-area__iframe");
      const frame = await frameHandle!.contentFrame();
      await frame!.fill("body", note);
    }

    for (const relation of relations) {
      await this.addRelation(relation.characterName, relation.relationName);
    }

    await this.page.getByTestId("character-modal-submit-button").click();
    await expect(this.characterCard(name)).toBeVisible();
  }

  async addRelation(characterName: string, relationName: string) {
    await this.page.getByTestId("relationbox-add-button").click();

    const dialog = this.page.getByRole("dialog", { name: "관계 추가" });
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button").filter({ hasText: characterName }).click();
    await this.page.getByTestId("add-relation-modal-relation-name-input").fill(relationName);
    await this.page.getByTestId("add-relation-modal-submit-button").click();

    await expect(dialog).toBeHidden();
  }

  async editCharacter() {
    // 캐릭터 모달 열기
    await this.page.getByTestId("character-card-0").click();

    // 캐릭터 이름 수정
    await this.page.getByTestId("character-modal-name-input").fill(EDITED_CHARACTER_NAME);

    // 태그 제거
    await this.page.getByTestId("tagbox-tag-remove-0").click();

    // 새 태그
    await this.page.getByTestId("tagbox-input").fill("수정된태그");
    await this.page.getByTestId("tagbox-input").press("Enter");
    await expect(this.page.getByTestId("tagbox-tag-0")).toHaveText("수정된태그");

    // 속성 수정
    await this.page.getByTestId("propertybox-key-0").fill("수정된속성키");
    await this.page.getByTestId("propertybox-value-0").fill("수정된 속성값");
    await expect(this.page.getByTestId("propertybox-key-0")).toHaveValue("수정된속성키");
    await expect(this.page.getByTestId("propertybox-value-0")).toHaveValue("수정된 속성값");

    // 메모 수정
    const frameHandle = await this.page.$("iframe.tox-edit-area__iframe");
    const frame = await frameHandle!.contentFrame();
    await frame!.fill("body", EDITED_MEMO);

    // 관계 추가
    await this.page.getByTestId("relationbox-add-button").click();
    await this.page.getByTestId("add-relation-modal-character-card-0").click();
    await this.page.getByTestId("add-relation-modal-relation-name-input").fill("친구");
    await this.page.getByTestId("add-relation-modal-submit-button").click();

    // 캐릭터 수정 저장
    await this.page.getByTestId("character-modal-submit-button").click();

    // 수정된 캐릭터 확인
    await expect(this.page.getByTestId("character-card-0")).toHaveText(EDITED_CHARACTER_NAME);

    // 다시 캐릭터 모달 열어서 수정된 내용 확인
    await this.page.getByTestId("character-card-0").click();

    // 수정된 캐릭터 이름 확인
    await expect(this.page.getByTestId("character-modal-name-input")).toHaveValue(
      EDITED_CHARACTER_NAME,
    );

    // 수정된 태그 확인
    await expect(this.page.getByTestId("tagbox-tag-0")).toHaveText("수정된태그");

    // 수정된 속성 확인
    await expect(this.page.getByTestId("propertybox-key-0")).toHaveValue("수정된속성키");
    await expect(this.page.getByTestId("propertybox-value-0")).toHaveValue("수정된 속성값");

    // 수정된 메모 확인
    const frameHandle2 = await this.page.$("iframe.tox-edit-area__iframe");
    const frame2 = await frameHandle2!.contentFrame();
    const memoContent = await frame2!.$eval("body", (el) => el.innerHTML);
    await expect(memoContent).toContain(EDITED_MEMO);

    // 추가된 관계 확인
    await expect(this.page.getByTestId("relationbox-character-card-0")).toHaveText(
      `${EDITED_CHARACTER_NAME}친구`,
    );
  }

  async uploadImage({ aspect }: { aspect?: "자유" | "1:1" } = {}) {
    await this.page.getByTestId("image-upload-upload-button").click();
    await this.page.setInputFiles("input[data-testid='image-upload-file-input']", TEST_AVATAR_PATH);

    // ReactCrop은 이미지가 로드된 뒤에야 크롭 영역을 만든다.
    // 로드 전에 저장을 누르면 아무 일도 일어나지 않으므로 로드를 기다린다.
    const cropImage = this.page.locator("img[alt='To be cropped']");
    await expect(cropImage).toBeVisible();
    await this.expectImageLoaded(cropImage);

    if (aspect === "자유") {
      await this.page.getByTestId("image-crop-modal-free-aspect-button").click();
    } else if (aspect === "1:1") {
      await this.page.getByTestId("image-crop-modal-square-aspect-button").click();
    }

    await this.page.getByTestId("image-crop-modal-save-button").click();
    await expect(this.page.getByTestId("image-crop-modal-save-button")).toBeHidden();

    // 이미지가 업로드 되었는지 확인
    const preview = this.page.getByTestId("image-upload-preview");
    await expect(preview).toHaveAttribute("src", /^blob:/);
    await this.expectImageLoaded(preview);
  }

  async removeImage() {
    await this.page.getByTestId("image-upload-remove-button").click();

    const preview = this.page.getByTestId("image-upload-preview");
    await expect(preview).not.toHaveAttribute("src", /^blob:/);
    await expect
      .poll(() => preview.evaluate((img: HTMLImageElement) => img.naturalWidth === 0))
      .toBe(true);
  }

  private async expectImageLoaded(image: Locator) {
    await expect
      .poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
      .toBe(true);
  }
}
