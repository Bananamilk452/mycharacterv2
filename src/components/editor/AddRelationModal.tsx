import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCollection } from "@/hooks/useCollection";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CharacterCard } from "./CharacterCard";

interface ImageCropModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  uuid: string;
  onComplete: (option: { characterUuid: string; relationName: string }) => void;
}

export function AddRelationModal({
  open,
  setOpen,
  uuid,
  onComplete,
}: ImageCropModalProps) {
  const { characters } = useCollection(uuid);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    null,
  );
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
      <DialogContent className="max-w-xl!">
        <DialogHeader>
          <DialogTitle>관계 추가</DialogTitle>
        </DialogHeader>

        <div className="border-input flex flex-wrap gap-4 rounded-md border p-4">
          {characters && characters.length > 0 ? (
            characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onClick={() => setSelectedCharacter(character.id)}
                className={
                  selectedCharacter === character.id
                    ? "border-primary border-2"
                    : ""
                }
              />
            ))
          ) : (
            <p className="text-sm text-gray-600">캐릭터가 없습니다.</p>
          )}
        </div>

        <Input
          placeholder="관계 이름"
          value={relationName}
          onChange={(e) => setRelationName(e.target.value)}
        />

        <DialogFooter>
          <Button
            disabled={!selectedCharacter || !relationName}
            onClick={onAdd}
          >
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
