import { FolderIcon } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CollectionInfo, listCollections } from "@/lib/db";

import { Spinner } from "../Spinner";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function OpenCollectionDialog({ open, setOpen }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [collections, setCollections] = useState<CollectionInfo[]>([]);

  useEffect(() => {
    function fetchCollections() {
      setIsLoading(true);
      listCollections().then((cols) => {
        setCollections(cols);
        setIsLoading(false);
      });
    }

    fetchCollections();
  }, []);

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>콜렉션 열기</DialogTitle>
        </DialogHeader>

        <ul className="h-96 divide-y-2 overflow-y-auto rounded-lg border-2">
          {isLoading && <Spinner />}
          {collections.length > 0 ? (
            collections.map((c) => (
              <li key={c.uuid}>
                <a
                  href={`/editor/${c.uuid}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-violet-600 hover:bg-gray-100 hover:underline"
                >
                  <FolderIcon className="size-4" />
                  {c.name}
                </a>
              </li>
            ))
          ) : (
            <p className="p-4 text-sm text-gray-600">콜렉션이 없습니다.</p>
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
