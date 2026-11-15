import JSZip from "jszip";

import { connectCollection } from "../db";

onmessage = async (event) => {
  const { dbName } = event.data;

  const collection = await connectCollection(dbName);
  const allCharacters = await collection.characters.toArray();
  const allGalleryImages = await collection.gallery.toArray();
  const collectionInfo = await collection.collectionInfo.get(1);

  const zip = new JSZip();
  zip.file("collectionInfo.json", JSON.stringify(collectionInfo, null, 2));
  zip.file("characters.json", JSON.stringify(allCharacters, null, 2));
  zip.file(
    "gallery.json",
    JSON.stringify(
      allGalleryImages.map((image) => ({
        id: image.id,
        characterId: image.characterId,
        createdAt: image.createdAt,
      })),
      null,
      2,
    ),
  );

  if (collectionInfo?.icon) {
    const iconBlob = await collectionInfo.icon.arrayBuffer();
    zip.file("icon.webp", iconBlob);
  }

  zip.folder("avatars");
  for (const character of allCharacters) {
    if (character.avatar) {
      const avatarBlob = await character.avatar.arrayBuffer();
      zip.file(`avatars/${character.id}.webp`, avatarBlob);
    }
  }

  zip.folder("gallery");
  for (const image of allGalleryImages) {
    if (image.image) {
      const imageBlob = await image.image.arrayBuffer();
      zip.file(`gallery/${image.id}.webp`, imageBlob);
    }
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });

  postMessage({
    file: zipBlob,
    name: `${collectionInfo?.name || collectionInfo?.uuid}.zip`,
  });
};
