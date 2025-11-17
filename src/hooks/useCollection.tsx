import { DB_PREFIX } from "@/constant";
import { Collection, connectCollection } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";

export function useCollection(uuid: string) {
  const [collection, setCollection] = useState<Collection | undefined>(
    undefined,
  );
  const [error, setError] = useState<Error | undefined>(undefined);

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
    connectCollection(`${DB_PREFIX}${uuid}`)
      .then((db) => {
        setCollection(db);
      })
      .catch((err) => {
        setError(err);
      });
  }, [uuid]);

  if (error) {
    throw error;
  }

  const ready = Boolean(collection && collectionInfo && characters);

  return {
    ready,
    collection,
    collectionInfo,
    characters,
  };
}
