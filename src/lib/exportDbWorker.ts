import JSZip from "jszip";

import { connectCollection } from "./db";

onmessage = async (event) => {
  const { dbName } = event.data;

  const collection = await connectCollection(dbName);
  const allCharacters = await collection.characters.toArray();
  const collectionInfo = await collection.collectionInfo.get(1);

  const zip = new JSZip();
  zip.file("collectionInfo.json", JSON.stringify(collectionInfo, null, 2));
  zip.file("characters.json", JSON.stringify(allCharacters, null, 2));

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

  const zipBlob = await zip.generateAsync({ type: "blob" });

  postMessage({
    file: zipBlob,
    name: `${collectionInfo?.name || collectionInfo?.uuid}.zip`,
  });
};
