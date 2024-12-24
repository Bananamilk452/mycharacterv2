import { Collection, connectCollection } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";

export function useCollection(uuid: string) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const collectionInfo = useLiveQuery(async () => {
    if (!collection) {
      return null;
    }

    const collectionInfo = await collection.collectionInfo.get(1);

    return collectionInfo;
  }, [collection]);

  const characters = useLiveQuery(async () => {
    if (!collection) {
      return null;
    }

    const characters = await collection.character.toArray();

    return characters;
  }, [collection]);

  useEffect(() => {
    connectCollection(uuid).then((db) => {
      setCollection(db);
    });
  }, []);

  return {
    collection,
    collectionInfo,
    characters,
  };
}
