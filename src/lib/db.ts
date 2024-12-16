import { Dexie, type EntityTable } from "dexie";
import { z } from "zod";

interface Character {
  id: number;
  name: string;
  property: string[];
  image: Blob;
}

interface CollectionInfo {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const collectionInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export function isCollectionInfo(obj: unknown): obj is CollectionInfo {
  return collectionInfoSchema.safeParse(obj).success;
}

// new Dexie는 생성/연결을 둘 다 하므로 아래 함수는 내부 함수로만만 사용
async function initCollection(name: string) {
  const db = new Dexie(name) as Dexie & {
    character: EntityTable<Character, "id">;
    collectionInfo: EntityTable<CollectionInfo, "id">;
  };

  db.version(1).stores({
    // property 구분자로 ||| 사용
    character: "++id, name, *property",
    collectionInfo: "++id, name",
  });

  return db;
}

async function isCollectionExists(collectionName: string): Promise<boolean> {
  const collectionList = await Dexie.getDatabaseNames();

  return collectionList.includes(collectionName);
}

async function createCollection(collectionName: string) {
  if (await isCollectionExists(collectionName)) {
    throw new Error("Collection already exists");
  }

  const db = await initCollection(collectionName);
  await db.collectionInfo.add({
    name: collectionName,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return db;
}

async function connectCollection(collectionName: string) {
  if (!(await isCollectionExists(collectionName))) {
    throw new Error("Collection not exists");
  }

  return await initCollection(collectionName);
}

export type { Character, CollectionInfo };
export { isCollectionExists, createCollection, connectCollection };
