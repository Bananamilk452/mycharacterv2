import { CollectionInfo, connectCollection, isCollectionInfo } from "@/lib/db";
import Dexie from "dexie";
import { useEffect, useState } from "react";

async function getRecentCollections() {
  const collectionNames = await Dexie.getDatabaseNames();

  // 모든 콜렉션의 메타데이터 가져오기
  const collectionDatas = await Promise.all(
    collectionNames.map(async (name) => {
      const db = await connectCollection(name);
      const info = await db.collectionInfo.get(1);

      return info;
    }),
  );

  // 메타데이터가 없는 콜렉션 제거
  const collectionsWithMetadata = collectionDatas.filter(
    (info): info is CollectionInfo => isCollectionInfo(info),
  );

  // 업데이트된 시간 순으로 정렬
  collectionsWithMetadata.sort((a, b) => {
    if (!a.updatedAt || !b.updatedAt) return 0;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  return collectionsWithMetadata;
}

export function useRecentCollections() {
  const [recentCollections, setRecentCollections] = useState<CollectionInfo[]>(
    [],
  );

  useEffect(() => {
    getRecentCollections().then((recentCollections) => {
      if (recentCollections) {
        setRecentCollections(recentCollections);
      }
    });
  });

  return { recentCollections };
}
