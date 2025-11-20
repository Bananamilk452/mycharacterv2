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
import { useCollection } from "@/hooks/useCollection";
import { Character } from "@/lib/db";
import { updateCollectionUpdatedAt } from "@/lib/utils";

import { CharacterCard } from "./CharacterCard";

interface DeleteCharacterModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  collectionUuid: string;
  character: Character;
}

export function DeleteCharacterModal({
  open,
  setOpen,
  collectionUuid,
  character,
}: DeleteCharacterModalProps) {
  const { collection, collectionInfo } = useCollection(collectionUuid);
  const [isLoading, setIsLoading] = useState(false);

  function onDelete() {
    if (!collection || !collectionInfo) {
      return;
    }

    setIsLoading(true);

    collection.characters
      .delete(character.id)
      .then(() => {
        updateCollectionUpdatedAt(collectionUuid);
        toast.success("캐릭터가 삭제되었습니다.");
        setOpen(false);
      })
      .catch((error) => {
        console.error(error);
        toast.error("캐릭터 삭제에 실패했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>캐릭터 삭제</DialogTitle>
          <DialogDescription>
            아래의 캐릭터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>

        <div>
          <CharacterCard character={character} />
        </div>

        {isLoading && (
          <Message variant="loading">캐릭터 삭제 중입니다...</Message>
        )}

        <DialogFooter>
          <Button variant="destructive" disabled={isLoading} onClick={onDelete}>
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
