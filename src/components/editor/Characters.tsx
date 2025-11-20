import { useEffect, useState } from "react";

import { useCollection } from "@/hooks/useCollection";
import { Character, CollectionInfo } from "@/lib/db";

import { CharacterCard } from "./CharacterCard";
import { CharacterFilter } from "./CharacterFilter";
import { CharacterModal } from "./CharacterModal";

export interface SearchParam {
  type: "relation" | "property" | "text";
  operation: ">" | "<" | ">=" | "<=" | "=";
  key?: string;
  value: string;
}
interface CharactersProps {
  collectionUuid: string;
}

export function Characters({ collectionUuid }: CharactersProps) {
  const { collection, collectionInfo, characters } = useCollection(
    collectionUuid as string,
  );

  const [searchParams, setSearchParams] = useState<SearchParam[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>(
    characters || [],
  );

  useEffect(() => {
    async function filterCharacters(searchParam: SearchParam) {
      if (!collection) return [];

      if (searchParam.type === "text") {
        return await collection.characters
          .where("name")
          .equalsIgnoreCase(searchParam.value)
          .toArray();
      } else if (searchParam.type === "property" && searchParam.key) {
        const characters = await collection.characters
          .where("propertyKeys")
          .equalsIgnoreCase(searchParam.key!)
          .toArray();

        return characters.filter((char) => {
          const index = char.propertyKeys.indexOf(searchParam.key!);
          const value = char.propertyValues[index];

          if ([">", "<", ">=", "<="].includes(searchParam.operation)) {
            if (
              isNaN(parseFloat(value)) ||
              isNaN(parseFloat(searchParam.value))
            ) {
              return false;
            }
          }

          switch (searchParam.operation) {
            case "=":
              return value === searchParam.value;
            case ">":
              return parseFloat(value) > parseFloat(searchParam.value);
            case "<":
              return parseFloat(value) < parseFloat(searchParam.value);
            case ">=":
              return parseFloat(value) >= parseFloat(searchParam.value);
            case "<=":
              return parseFloat(value) <= parseFloat(searchParam.value);
            default:
              return false;
          }
        });
      } else if (searchParam.type === "relation") {
        return await collection.characters
          .where("relations")
          .equalsIgnoreCase(searchParam.value)
          .toArray();
      } else {
        return [];
      }
    }

    async function applyFilters() {
      const characters = await Promise.all(
        searchParams.map((param) => filterCharacters(param)),
      );

      const characterIds = characters.map((chars) =>
        chars.map((char) => char.id),
      );

      const characterMap = new Map<string, Character>();
      characters.flat().forEach((char) => {
        characterMap.set(char.id, char);
      });

      // Intersection of character IDs
      const filteredIds = characterIds.reduce((a, b) =>
        a.filter((c) => b.includes(c)),
      );

      const filteredChars = filteredIds.map((id) => characterMap.get(id)!);

      setFilteredCharacters(filteredChars);
    }

    if (searchParams.length > 0) {
      applyFilters();
    }
  }, [searchParams, collection]);

  return (
    <div className="flex size-full flex-col">
      <CharacterFilter
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      />
      <section id="characters" className="size-full overflow-y-auto p-4">
        <ul className="flex flex-wrap gap-4">
          {searchParams.length > 0 ? (
            <CharacterCards
              characters={filteredCharacters}
              collectionInfo={collectionInfo!}
              collectionUuid={collectionUuid}
            />
          ) : (
            <CharacterCards
              characters={characters || []}
              collectionInfo={collectionInfo!}
              collectionUuid={collectionUuid}
            />
          )}
        </ul>
      </section>
    </div>
  );
}

function CharacterCards({
  characters,
  collectionInfo,
  collectionUuid,
}: {
  characters: Character[];
  collectionInfo: CollectionInfo;
  collectionUuid: string;
}) {
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );

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
    <>
      {characters.map((character) => (
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
      <CharacterModal
        open={isCharacterModalOpen}
        setOpen={setIsCharacterModalOpen}
        collectionUuid={collectionUuid}
        character={selectedCharacter!}
      />
    </>
  );
}
