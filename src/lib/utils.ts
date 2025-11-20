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

export function getSearchParamDescription(
  type: string | undefined,
  operation: string | undefined,
  key?: string | undefined,
  value?: string | undefined,
) {
  if (!type || !operation) return "검색 조건을 선택하세요.";

  if (!value || (type === "property" && !key)) {
    return "값을 입력하세요.";
  }

  let result = "";

  if (type === "text") {
    if (operation === "=") {
      result = `이름이 "${value}"인 캐릭터`;
    }
  }

  if (type === "property") {
    if (operation === "=") {
      result = `속성 "${key}"이(가) 값 "${value}"인 캐릭터`;
    } else if (operation === "%") {
      result = `속성 "${key}"이(가) 값 "${value}"을(를) 포함하는 캐릭터`;
    } else if (operation === ">") {
      result = `속성 "${key}"이(가) 값 "${value}"보다 큰 캐릭터 (숫자인 경우에만)`;
    } else if (operation === "<") {
      result = `속성 "${key}"이(가) 값 "${value}"보다 작은 캐릭터 (숫자인 경우에만)`;
    } else if (operation === ">=") {
      result = `속성 "${key}"이(가) 값 "${value}"보다 크거나 같은 캐릭터 (숫자인 경우에만)`;
    } else if (operation === "<=") {
      result = `속성 "${key}"이(가) 값 "${value}"보다 작거나 같은 캐릭터 (숫자인 경우에만)`;
    }
  }

  if (type === "relation") {
    if (operation === "=") {
      result = `관계가 "${value}"인 캐릭터`;
    }
  }
  return result;
}
