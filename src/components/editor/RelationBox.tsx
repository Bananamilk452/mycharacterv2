import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { useCollection } from "@/hooks/useCollection";
import { Character } from "@/lib/db";

import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { AddRelationModal } from "./AddRelationModal";
import { CharacterCard } from "./CharacterCard";
import { EditorFormProps } from "./CharacterModal";

export function RelationBox({
  form,
  collectionUuid,
}: EditorFormProps & { collectionUuid: string }) {
  const relationKeys = form.watch("relationKeys");
  const relationValues = form.watch("relationValues");
  const { collection } = useCollection(collectionUuid);
  const [isAddRelationModalOpen, setIsAddRelationModalOpen] = useState(false);
  const [relationCharacters, setRelationCharacters] = useState<
    { character: Character; relationName: string }[]
  >([]);

  useEffect(() => {
    if (collection) {
      collection.characters
        .where("uuid")
        .anyOf(relationKeys)
        .toArray()
        .then((chars) => {
          setRelationCharacters(
            relationKeys.map((key, i) => {
              return {
                character: chars.find((c) => c.id === key)!,
                relationName: relationValues[i],
              };
            }),
          );
        });
    }
  }, [collection, relationKeys, relationValues]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <Label className="shrink-0">관계</Label>
        <Button
          type="button"
          size="sm"
          onClick={() => setIsAddRelationModalOpen(true)}
        >
          <PlusIcon />
          관계 추가
        </Button>
      </div>
      <div className="border-input mt-3.5 flex h-64 flex-wrap gap-4 overflow-scroll rounded-md border p-4 shadow-xs">
        {relationCharacters.map((r) => (
          <CharacterCard
            key={crypto.randomUUID()}
            size="sm"
            character={r.character}
            description={r.relationName}
          />
        ))}
      </div>

      <AddRelationModal
        open={isAddRelationModalOpen}
        setOpen={setIsAddRelationModalOpen}
        uuid={collectionUuid}
        onComplete={(r) => {
          const length = form.getValues("relationKeys").length;
          form.setValue(`relationKeys.${length}`, r.characterUuid);
          form.setValue(`relationValues.${length}`, r.relationName);
        }}
      />
    </div>
  );
}
