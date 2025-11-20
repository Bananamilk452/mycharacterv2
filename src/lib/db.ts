import { Dexie } from "dexie";
import { z } from "zod";

import { DB_PREFIX } from "@/constant";
import dexieUuid from "@/lib/db/uuid";

import type { EntityTable } from "dexie";

interface Character {
  id: string;
  name: string;
  avatar?: Blob;
  propertyKeys: string[];
  propertyValues: string[];
  tags: string[];
  note: string;
  relationKeys: string[];
  relationValues: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface CollectionInfo {
  id: number;
  uuid: string;
  name: string;
  icon?: Blob;
  description: string;
  characterDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

type Collection = Dexie & {
  characters: EntityTable<Character, "id">;
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
async function initCollection(name: string) {
  const db = new Dexie(name, { addons: [dexieUuid] }) as Collection;

  db.version(1).stores({
    characters:
      "$$id, name, *propertyKeys, *propertyValues, *tags, createdAt, updatedAt",
    collectionInfo:
      "++id, uuid, name, description, characterDescription, createdAt, updatedAt",
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
    description: "",
    characterDescription: "",
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

async function listCollections() {
  const collections = await Dexie.getDatabaseNames();
  const onlyCollections = collections.filter((name) =>
    name.startsWith(DB_PREFIX),
  );

  const result = await Promise.all(
    onlyCollections.map(async (name) => {
      const db = await connectCollection(name);
      const info = await db.collectionInfo.get(1);

      if (!info) {
        throw new Error("콜렉션 정보를 불러올 수 없습니다.");
      }

      return info;
    }),
  );

  return result;
}

async function exportCollection(name: string) {
  const worker = new Worker(new URL("./exportDbWorker.ts", import.meta.url), {
    type: "module",
  });

  worker.postMessage({ dbName: name });

  return new Promise<{ file: Blob; name: string }>((resolve) => {
    worker.onmessage = (event) => {
      resolve(event.data as { file: Blob; name: string });
    };
  });
}

export type { Character, CollectionInfo, Collection };
export {
  isCollectionExists,
  createCollection,
  connectCollection,
  listCollections,
  exportCollection,
};
