import JSZip from "jszip";

import { DB_PREFIX } from "../constant";
import {
  Character,
  CollectionInfo,
  initCollection,
  isCollectionExists,
} from "./db";

onmessage = async (event) => {
  try {
    const { file } = event.data as { file: File };

    const zip = await JSZip.loadAsync(await file.arrayBuffer());

    const collectionInfoString = await zip
      .file("collectionInfo.json")
      ?.async("string");
    const charactersString = await zip.file("characters.json")?.async("string");

    if (!collectionInfoString || !charactersString) {
      throw new Error("잘못된 파일 형식입니다.");
    }

    const collectionInfo = JSON.parse(collectionInfoString) as CollectionInfo;
    const characters = JSON.parse(charactersString) as Character[];

    if (await isCollectionExists(`${DB_PREFIX}${collectionInfo.uuid}`)) {
      throw new Error("이미 존재하는 콜렉션입니다.");
    }

    const collection = await initCollection(
      `${DB_PREFIX}${collectionInfo.uuid}`,
    );

    const iconFile = zip.file("icon.webp");
    if (iconFile) {
      const iconBlob = await iconFile.async("blob");
      collectionInfo.icon = iconBlob;
    }

    await collection.collectionInfo.add(collectionInfo);

    for (const character of characters) {
      const avatarFile = zip.file(`avatars/${character.id}.webp`);
      if (avatarFile) {
        const avatarBlob = await avatarFile.async("blob");
        character.avatar = avatarBlob;
      }

      await collection.characters.add(character);
    }

    postMessage({ success: true, uuid: collectionInfo.uuid });
  } catch (error) {
    console.error(error);
    postMessage({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    });
  }
};
