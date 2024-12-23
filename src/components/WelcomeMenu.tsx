import { Folder, Plus } from "lucide-react";
import { CreateCollectionDialog } from "@/components/CreateCollectionDialog";
import { useRecentCollections } from "@/hooks/useRecentCollections";

export function WelcomeMenu() {
  const { recentCollections } = useRecentCollections();

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-bold">마이자캐</h1>

      <h3 className="mt-8 font-medium">시작하기</h3>
      <ul className="mt-2 space-y-3">
        <li>
          <CreateCollectionDialog>
            <button className="flex items-center gap-2 text-purple-600 hover:underline">
              <Plus className="size-5" />
              <span className="text-sm">콜렉션 추가</span>
            </button>
          </CreateCollectionDialog>
        </li>
      </ul>

      <h3 className="mt-24 font-medium">최근 파일</h3>
      <ul className="mt-2 space-y-3">
        {recentCollections.length === 0 && (
          <li>
            <span className="text-sm text-gray-500">최근 파일이 없습니다.</span>
          </li>
        )}

        {recentCollections.map((collection) => (
          <li key={collection.createdAt.getTime()}>
            <a
              href={`/editor/${collection.uuid}`}
              className="flex items-center gap-2 text-purple-600 hover:underline"
            >
              <Folder className="size-5" />
              <span className="text-sm">{collection.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
