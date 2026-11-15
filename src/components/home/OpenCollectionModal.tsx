import { FolderIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { DeleteCollectionModal } from "../editor/DeleteCollectionModal";
import { Spinner } from "../Spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CollectionInfo, listCollections } from "@/lib/db";

interface OpenCollectionModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function OpenCollectionModal({ open, setOpen }: OpenCollectionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [collections, setCollections] = useState<CollectionInfo[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCollection, setSelectedCollection] = useState<CollectionInfo | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    function fetchCollections() {
      setIsLoading(true);
      listCollections()
        .then((cols) => {
          setCollections(cols);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    if (open) {
      fetchCollections();
    }
  }, [open, refreshKey]);

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>콜렉션 열기</DialogTitle>
          </DialogHeader>

          <ul className="h-96 divide-y-2 overflow-y-auto rounded-lg border-2">
            {isLoading && <Spinner />}
            {collections.length > 0 ? (
              collections.map((c) => (
                <li
                  key={c.uuid}
                  className="flex items-center justify-between gap-2 hover:bg-gray-100"
                >
                  <a
                    href={`/editor/${c.uuid}`}
                    onClick={() => setOpen(false)}
                    className="flex min-w-0 grow items-center gap-2 px-3 py-2 text-sm text-violet-600 hover:underline"
                  >
                    <FolderIcon className="size-4 shrink-0" />
                    <span className="truncate">{c.name}</span>
                  </a>
                  <button
                    type="button"
                    className="mr-2 flex size-8 shrink-0 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
                    aria-label={`${c.name} 콜렉션 삭제`}
                    data-testid="open-collection-delete-button"
                    onClick={() => {
                      setSelectedCollection(c);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </li>
              ))
            ) : (
              <p className="p-4 text-sm text-gray-600">콜렉션이 없습니다.</p>
            )}
          </ul>
        </DialogContent>
      </Dialog>

      {selectedCollection && (
        <DeleteCollectionModal
          open={isDeleteModalOpen}
          setOpen={setIsDeleteModalOpen}
          collectionUuid={selectedCollection.uuid}
          collectionName={selectedCollection.name}
          onDeleted={() => {
            setSelectedCollection(null);
            setRefreshKey((key) => key + 1);
          }}
        />
      )}
    </>
  );
}
