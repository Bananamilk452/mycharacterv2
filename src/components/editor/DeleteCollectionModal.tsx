import Dexie from "dexie";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Message } from "@/components/ui/message";
import { Note } from "@/components/ui/note";
import { DB_PREFIX } from "@/constant";

interface DeleteCollectionModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  collectionUuid: string;
  collectionName: string;
  onDeleted?: () => void;
}

export function DeleteCollectionModal({
  open,
  setOpen,
  collectionUuid,
  collectionName,
  onDeleted,
}: DeleteCollectionModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  function onDelete() {
    setIsLoading(true);

    Dexie.delete(`${DB_PREFIX}${collectionUuid}`)
      .then(() => {
        toast.success("콜렉션이 삭제되었습니다.");
        setOpen(false);
        onDeleted?.();
      })
      .catch((error) => {
        console.error(error);
        toast.error("콜렉션 삭제에 실패했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>콜렉션 삭제</DialogTitle>
          <DialogDescription>
            <span className="font-medium">{collectionName}</span> 콜렉션을 삭제하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <Note variant="danger">
          콜렉션의 캐릭터, 관계, 갤러리 등 모든 데이터가 함께 삭제됩니다. 이 작업은 되돌릴 수
          없습니다.
        </Note>

        {isLoading && <Message variant="loading">콜렉션 삭제 중입니다...</Message>}

        <DialogFooter>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={onDelete}
            data-testid="delete-collection-submit-button"
          >
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
