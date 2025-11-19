import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { DB_PREFIX } from "@/constant";

import { connectCollection } from "./db";

import type { ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function updateCollectionUpdatedAt(uuid: string) {
  const collection = await connectCollection(`${DB_PREFIX}${uuid}`);

  await collection.collectionInfo.update(1, {
    updatedAt: new Date(),
  });
}
