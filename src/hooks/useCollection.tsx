import { Collection, connectCollection } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";

export function useCollection(uuid: string) {
  const [collection, setCollection] = useState<Collection | undefined>(
    undefined,
  );
  const [ready, setReady] = useState(false);

  const collectionInfo = useLiveQuery(async () => {
    if (!collection) {
      return undefined;
    }

    const collectionInfo = await collection.collectionInfo.get(1);

    return collectionInfo;
  }, [collection]);

  const characters = useLiveQuery(async () => {
    if (!collection) {
      return undefined;
    }

    const characters = await collection.character.toArray();

    return characters;
  }, [collection]);

  useEffect(() => {
    connectCollection(uuid).then((db) => {
      setCollection(db);
    });
  }, []);

  useEffect(() => {
    if (collection && collectionInfo && characters) {
      setReady(true);
    }
  }, [collection, collectionInfo, characters]);

  return {
    ready,
    collection,
    collectionInfo,
    characters,
  };
}
