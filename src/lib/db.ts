import { Dexie, type EntityTable } from "dexie";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

interface Character {
  id: number;
  name: string;
  propertyKeys: string[];
  propertyValues: string[];
  image: Blob;
}

interface CollectionInfo {
  uuid: string;
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const collectionInfoSchema = z.object({
  uuid: z.string(),
  id: z.number(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export function isCollectionInfo(obj: unknown): obj is CollectionInfo {
  return collectionInfoSchema.safeParse(obj).success;
}

// new Dexie는 생성/연결을 둘 다 하므로 아래 함수는 내부 함수로만만 사용
async function initCollection(uuid: string) {
  const db = new Dexie(uuid) as Dexie & {
    character: EntityTable<Character, "id">;
    collectionInfo: EntityTable<CollectionInfo, "id">;
  };

  db.version(1).stores({
    character: "++id, name, *propertyKeys, *propertyValues",
    collectionInfo: "++id, name",
  });

  return db;
}

async function isCollectionExists(uuid: string): Promise<boolean> {
  const collectionList = await Dexie.getDatabaseNames();

  return collectionList.includes(uuid);
}

async function createCollection(collectionName: string) {
  const uuid = uuidv4();

  const db = await initCollection(uuid);
  await db.collectionInfo.add({
    uuid,
    name: collectionName,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return db;
}

async function connectCollection(uuid: string) {
  if (!(await isCollectionExists(uuid))) {
    throw new Error("Collection not exists");
  }

  return await initCollection(uuid);
}

export type { Character, CollectionInfo };
export { isCollectionExists, createCollection, connectCollection };
