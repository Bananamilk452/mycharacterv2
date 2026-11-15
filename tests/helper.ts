import { expect, type Locator, Page } from "@playwright/test";

import {
  EDITED_CHARACTER_NAME,
  EDITED_MEMO,
  TEST_AVATAR_PATH,
  TEST_CHARACTER_NAME,
  TEST_COLLECTION_NAME,
  TEST_MEMO,
} from "./constants";

export class Helper {
  constructor(public readonly page: Page) {}

  async closeDialog() {
    await this.page.locator("[data-slot='dialog-close']").first().click();
  }

  async createCollection() {
    // 홈 화면(WelcomeMenu)과 에디터(메뉴바) 중 어디에 있든 동작하도록 한다.
    // isVisible()은 대기하지 않으므로 or()로 두 버튼 중 하나를 기다린다.
    const createCollectionButton = this.page
      .getByTestId("welcomemenu-create-collection")
      .or(this.page.getByTestId("menubar-create-collection"));

    await createCollectionButton.first().click();

    await this.page.getByTestId("create-collection-name-input").fill(TEST_COLLECTION_NAME);
    await this.page.getByTestId("create-collection-submit-button").click();

    await expect(this.page.getByTestId("sidebar-collection-name")).toHaveText(TEST_COLLECTION_NAME);
  }

  async createCharacter({ uploadAvatar = true }: { uploadAvatar?: boolean } = {}) {
    await this.page.getByTestId("sidebar-add-character-button").click();

    // 캐릭터 이름 입력
    await this.page.getByTestId("character-modal-name-input").fill(TEST_CHARACTER_NAME);

    // 캐릭터 이미지 업로드 (이미지 제거/재업로드 포함)
    if (uploadAvatar) {
      await this.uploadAvatar();

      // 이미지 제거 기능 작동하는지 확인
      await this.removeAvatar();

      // 다시 이미지 업로드
      await this.uploadAvatar();
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

  private async uploadAvatar() {
    await this.page.getByTestId("image-upload-upload-button").click();
    await this.page.setInputFiles("input[data-testid='image-upload-file-input']", TEST_AVATAR_PATH);

    // ReactCrop은 이미지가 로드된 뒤에야 크롭 영역을 만든다.
    // 로드 전에 저장을 누르면 아무 일도 일어나지 않으므로 로드를 기다린다.
    const cropImage = this.page.locator("img[alt='To be cropped']");
    await expect(cropImage).toBeVisible();
    await this.expectImageLoaded(cropImage);

    await this.page.getByTestId("image-crop-modal-save-button").click();
    await expect(this.page.getByTestId("image-crop-modal-save-button")).toBeHidden();

    // 이미지가 업로드 되었는지 확인
    const preview = this.page.getByTestId("image-upload-preview");
    await expect(preview).toHaveAttribute("src", /^blob:/);
    await this.expectImageLoaded(preview);
  }

  private async removeAvatar() {
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
