import { useState } from "react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CharacterCard } from "./CharacterCard";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCollection } from "@/hooks/useCollection";

interface AddRelationModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  uuid: string;
  onComplete: (option: { characterUuid: string; relationName: string }) => void;
}

export function AddRelationModal({ open, setOpen, uuid, onComplete }: AddRelationModalProps) {
  const { characters } = useCollection(uuid);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [relationName, setRelationName] = useState("");

  function onAdd() {
    if (selectedCharacter) {
      onComplete({
        characterUuid: selectedCharacter,
        relationName,
      });
      setOpen(false);
      setSelectedCharacter(null);
      setRelationName("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex h-fit max-h-[calc(100dvh-48px)]! max-w-3xl! flex-col">
        <DialogHeader>
          <DialogTitle>관계 추가</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-wrap content-start gap-4 overflow-y-auto rounded-md border border-input p-4">
          {characters && characters.length > 0 ? (
            characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onClick={() => setSelectedCharacter(character.id)}
                className={selectedCharacter === character.id ? "border-2 border-primary" : ""}
              />
            ))
          ) : (
            <p className="text-sm text-gray-600">캐릭터가 없습니다.</p>
          )}
        </div>

        <Input
          className="shrink-0"
          placeholder="관계 이름"
          value={relationName}
          onChange={(e) => setRelationName(e.target.value)}
        />

        <DialogFooter className="shrink-0">
          <Button disabled={!selectedCharacter || !relationName} onClick={onAdd}>
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
