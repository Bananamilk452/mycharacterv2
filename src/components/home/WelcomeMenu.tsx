import { FolderIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

import { CreateCollectionDialog } from "@/components/home/CreateCollectionDialog";
import { useRecentCollections } from "@/hooks/useRecentCollections";

import { OpenCollectionDialog } from "./OpenCollectionModal";

export function WelcomeMenu() {
  const { recentCollections } = useRecentCollections();
  const [isCreateCollectionDialogOpen, setIsCreateCollectionDialogOpen] =
    useState(false);
  const [isOpenCollectionDialogOpen, setIsOpenCollectionDialogOpen] =
    useState(false);

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-bold">마이자캐</h1>
      <p className="text-sm text-gray-600">
        알파 버전입니다. 데이터의 소실이 있을 수도 있습니다.
        <br />
        피드백은 언제나 환영입니다! 😊
      </p>

      <h3 className="mt-8 font-medium">시작하기</h3>
      <ul className="mt-2 space-y-4">
        <li>
          <button
            onClick={() => setIsCreateCollectionDialogOpen(true)}
            className="flex items-center gap-2 text-violet-600 hover:underline"
          >
            <PlusIcon className="size-5" />
            <span className="text-sm">콜렉션 추가</span>
          </button>
          <CreateCollectionDialog
            open={isCreateCollectionDialogOpen}
            setOpen={setIsCreateCollectionDialogOpen}
          />
        </li>
        <li>
          <button
            onClick={() => setIsOpenCollectionDialogOpen(true)}
            className="flex items-center gap-2 text-violet-600 hover:underline"
          >
            <FolderIcon className="size-5" />
            <span className="text-sm">콜렉션 열기</span>
          </button>
          <OpenCollectionDialog
            open={isOpenCollectionDialogOpen}
            setOpen={setIsOpenCollectionDialogOpen}
          />
        </li>
      </ul>

      <h3 className="mt-24 font-medium">최근 콜렉션</h3>
      <ul className="mt-2 space-y-3">
        {recentCollections.length === 0 && (
          <li>
            <span className="text-sm text-gray-500">
              최근 콜렉션이 없습니다.
            </span>
          </li>
        )}

        {recentCollections.map((collection) => (
          <li key={collection.createdAt.getTime()}>
            <a
              href={`/editor/${collection.uuid}`}
              className="flex items-center gap-2 text-violet-600 hover:underline"
            >
              <FolderIcon className="size-5" />
              <span className="text-sm">{collection.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
