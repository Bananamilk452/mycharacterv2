import { useState } from "react";

import { useCollection } from "@/hooks/useCollection";
import { Character } from "@/lib/db";

import { CharacterCard } from "./CharacterCard";
import { CharacterModal } from "./CharacterModal";

interface CharactersProps {
  collectionUuid: string;
}

export function Characters({ collectionUuid }: CharactersProps) {
  const { collectionInfo, characters } = useCollection(
    collectionUuid as string,
  );
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] =
    useState<Character | null>();

  const templates =
    collectionInfo?.characterDescription.match(/\{\{(.+)\}\}/gm);
  function getCharacterDescription(character: Character) {
    const fields = templates?.map((template) => {
      const fieldName = template.replace("{{", "").replace("}}", "").trim();
      return { template, fieldName };
    });

    let description = collectionInfo?.characterDescription || "";
    if (fields) {
      fields.forEach(({ template, fieldName }) => {
        const index = character.propertyKeys.indexOf(fieldName);
        if (index !== -1) {
          const value = character.propertyValues[index];
          description = description.replace(template, value);
        } else {
          description = description.replace(template, "-");
        }
      });
    }
    return description;
  }

  return (
    <section id="characters" className="p-4">
      <ul className="flex flex-wrap gap-4">
        {characters?.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            description={getCharacterDescription(character)}
            className="cursor-pointer"
            onClick={() => {
              setSelectedCharacter(character);
              setIsCharacterModalOpen(true);
            }}
          />
        ))}
      </ul>
      <CharacterModal
        open={isCharacterModalOpen}
        setOpen={setIsCharacterModalOpen}
        collectionUuid={collectionUuid}
        character={selectedCharacter!}
      />
    </section>
  );
}
