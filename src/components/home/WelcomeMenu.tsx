import { FolderIcon, ImportIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

import { CreateCollectionDialog } from "@/components/home/CreateCollectionDialog";
import { useRecentCollections } from "@/hooks/useRecentCollections";

import { ImportCollectionModal } from "../editor/ImportCollectionModal";
import { OpenCollectionModal } from "./OpenCollectionModal";

export function WelcomeMenu() {
  const { recentCollections } = useRecentCollections();
  const [isCreateCollectionDialogOpen, setIsCreateCollectionDialogOpen] =
    useState(false);
  const [isOpenCollectionDialogOpen, setIsOpenCollectionDialogOpen] =
    useState(false);
  const [isImportCollectionDialogOpen, setIsImportCollectionDialogOpen] =
    useState(false);

  return (
    <div className="flex gap-24">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold">마이자캐</h1>
        <p className="text-sm text-gray-600">
          알파 버전입니다. 데이터의 소실이 있을 수도 있습니다.
          <br />
          피드백은 언제나 환영입니다! 😊
          <br />
          <br />
          모든 데이터는 브라우저 (로컬)에 저장됩니다.
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
            <OpenCollectionModal
              open={isOpenCollectionDialogOpen}
              setOpen={setIsOpenCollectionDialogOpen}
            />
          </li>
          <li>
            <button
              onClick={() => setIsImportCollectionDialogOpen(true)}
              className="flex items-center gap-2 text-violet-600 hover:underline"
            >
              <ImportIcon className="size-5" />
              <span className="text-sm">가져오기</span>
            </button>
            <ImportCollectionModal
              open={isImportCollectionDialogOpen}
              setOpen={setIsImportCollectionDialogOpen}
            />
          </li>
        </ul>

        <h3 className="mt-20 font-medium">최근 콜렉션</h3>
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
      <div className="flex max-w-72 flex-col gap-4">
        <p className="text-sm break-keep text-gray-600">
          이 프로젝트는 오픈소스 프로젝트입니다.{" "}
          <a
            href="https://github.com/Bananamilk452/mycharacterv2"
            target="_blank"
            rel="noreferrer"
            className="text-violet-600 hover:underline"
          >
            GitHub에서 확인하기
          </a>
        </p>
        <p className="text-sm break-keep text-gray-600">
          피드백 / 버그 리포트 주시는 곳 (편히 연락 주세요 진짜 원하는 기능
          가능하면 다 넣어드려요):
          <br />
          <br />
          트위터{" "}
          <a
            href="https://x.com/starterdroid"
            target="_blank"
            rel="noreferrer"
            className="text-violet-600 hover:underline"
          >
            @starterdroid
          </a>
          <br />
          블루스카이{" "}
          <a
            href="https://bsky.app/profile/junsu.io"
            target="_blank"
            rel="noreferrer"
            className="text-violet-600 hover:underline"
          >
            @junsu.io
          </a>
          <br />
          연합우주{" "}
          <a
            href="https://serafuku.moe/@starterdroid"
            target="_blank"
            rel="noreferrer"
            className="text-violet-600 hover:underline"
          >
            @starterdroid
          </a>
          <br />
          이메일{" "}
          <a
            href="mailto:bananamilk452@gmail.com"
            className="text-violet-600 hover:underline"
          >
            bananamilk452@gmail.com
          </a>
          <br />
        </p>

        <p className="text-sm break-keep text-gray-600">
          패치노트
          <br />- 캐릭터 크기 조절 기능 추가 (11.25)
        </p>
      </div>
    </div>
  );
}
