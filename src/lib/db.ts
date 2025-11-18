import { Dexie } from "dexie";
import { z } from "zod";

import { DB_PREFIX } from "@/constant";

import type { EntityTable } from "dexie";

interface Character {
  id: number;
  avatar?: Blob;
  name: string;
  propertyKeys: string[];
  propertyValues: string[];
  tags: string[];
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CollectionInfo {
  id: number;
  uuid: string;
  name: string;
  icon?: Blob;
  createdAt: Date;
  updatedAt: Date;
}

type Collection = Dexie & {
  character: EntityTable<Character, "id">;
  collectionInfo: EntityTable<CollectionInfo, "id">;
};

const collectionInfoSchema = z.object({
  id: z.number(),
  uuid: z.string(),
  name: z.string(),
  icon: z.instanceof(Blob).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export function isCollectionInfo(obj: unknown): obj is CollectionInfo {
  return collectionInfoSchema.safeParse(obj).success;
}

// new Dexie는 생성/연결을 둘 다 하므로 아래 함수는 내부 함수로만만 사용
async function initCollection(uuid: string) {
  const db = new Dexie(uuid) as Collection;

  db.version(1).stores({
    character:
      "++id, name, *propertyKeys, *propertyValues, *tags, createdAt, updatedAt",
    collectionInfo: "++id, name, uuid, createdAt, updatedAt",
  });

  return db;
}

async function isCollectionExists(name: string): Promise<boolean> {
  const result = await Dexie.exists(name);

  return result;
}

async function createCollection(collectionName: string) {
  const uuid = crypto.randomUUID();

  const db = await initCollection(`${DB_PREFIX}${uuid}`);
  await db.collectionInfo.add({
    uuid,
    name: collectionName,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return db;
}

async function connectCollection(name: string) {
  if (!(await isCollectionExists(name))) {
    throw new Error("콜렉션이 존재하지 않습니다.");
  }

  return await initCollection(name);
}

export type { Character, CollectionInfo, Collection };
export { isCollectionExists, createCollection, connectCollection };
