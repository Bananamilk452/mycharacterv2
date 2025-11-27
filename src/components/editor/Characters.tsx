import { SquarePenIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { useCollection } from "@/hooks/useCollection";
import { Character, CollectionInfo } from "@/lib/db";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { CharacterCard } from "./CharacterCard";
import { CharacterFilter } from "./CharacterFilter";
import { CharacterModal } from "./CharacterModal";
import { DeleteCharacterModal } from "./DeleteCharacterModal";

export interface SearchParam {
  type: "relation" | "property" | "text";
  operation: ">" | "<" | ">=" | "<=" | "=";
  key?: string;
  value: string;
}

export interface SortParam {
  type: "name" | "createdAt" | "updatedAt" | "property";
  order: "asc" | "desc";
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
  const [sortParams, setSortParams] = useState<SortParam>({
    type: "createdAt",
    order: "asc",
    value: "",
  });
  const [refinedCharacters, setRefinedCharacters] = useState<Character[]>(
    characters || [],
  );

  const [characterSize, setCharacterSize] = useState(1);

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

      return filteredChars;
    }

    function applySorting(characters: Character[]) {
      const sortedCharacters = [...characters];
      sortedCharacters.sort((a, b) => {
        let aValue: string | Date = "";
        let bValue: string | Date = "";

        if (sortParams.type === "name") {
          aValue = a.name;
          bValue = b.name;
        } else if (sortParams.type === "createdAt") {
          aValue = a.createdAt;
          bValue = b.createdAt;
        } else if (sortParams.type === "updatedAt") {
          aValue = a.updatedAt;
          bValue = b.updatedAt;
        } else if (sortParams.type === "property") {
          const aIndex = a.propertyKeys.indexOf(sortParams.value);
          const bIndex = b.propertyKeys.indexOf(sortParams.value);
          aValue = aIndex !== -1 ? a.propertyValues[aIndex] : "";
          bValue = bIndex !== -1 ? b.propertyValues[bIndex] : "";
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          // 결측값이면 무조건 뒤로 보내기
          if (aValue === "" && bValue !== "") return 1;
          if (aValue !== "" && bValue === "") return -1;

          if (sortParams.order === "asc") {
            return aValue.localeCompare(bValue);
          } else {
            return bValue.localeCompare(aValue);
          }
        } else if (aValue instanceof Date && bValue instanceof Date) {
          if (sortParams.order === "asc") {
            return aValue.getTime() - bValue.getTime();
          } else {
            return bValue.getTime() - aValue.getTime();
          }
        } else {
          return 0;
        }
      });

      return sortedCharacters;
    }

    async function getRefinedCharacters() {
      let result: Character[] = characters || [];

      if (searchParams.length > 0) {
        result = await applyFilters();
      }

      result = applySorting(result);

      setRefinedCharacters(result);
    }

    getRefinedCharacters();
  }, [
    searchParams,
    collection,
    sortParams.type,
    sortParams.value,
    sortParams.order,
    characters,
  ]);

  return (
    <div className="flex size-full flex-col">
      <CharacterFilter
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        characterSize={characterSize}
        setCharacterSize={setCharacterSize}
        setSortParams={setSortParams}
      />
      <section id="characters" className="size-full overflow-y-auto p-4">
        <ul className="flex flex-wrap gap-4">
          <CharacterCards
            characters={refinedCharacters}
            characterSize={characterSize}
            collectionInfo={collectionInfo!}
            collectionUuid={collectionUuid}
          />
        </ul>
      </section>
    </div>
  );
}

function CharacterCards({
  characters,
  characterSize,
  collectionInfo,
  collectionUuid,
}: {
  characters: Character[];
  characterSize: number;
  collectionInfo: CollectionInfo;
  collectionUuid: string;
}) {
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );
  const [isDeleteCharacterModalOpen, setIsDeleteCharacterModalOpen] =
    useState(false);

  const size =
    characterSize === 0
      ? "sm"
      : characterSize === 1
        ? "md"
        : characterSize === 2
          ? "lg"
          : "xl";

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
        <ContextMenu key={character.id}>
          <ContextMenuTrigger>
            <CharacterCard
              character={character}
              description={getCharacterDescription(character)}
              className="cursor-pointer"
              size={size}
              onClick={() => {
                setSelectedCharacter(character);
                setIsCharacterModalOpen(true);
              }}
            />
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              onClick={() => {
                setSelectedCharacter(character);
                setIsCharacterModalOpen(true);
              }}
            >
              <SquarePenIcon />
              수정
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                setSelectedCharacter(character);
                setIsDeleteCharacterModalOpen(true);
              }}
            >
              <TrashIcon className="text-red-600" />
              <span className="text-red-600 hover:text-red-600">삭제</span>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
      <CharacterModal
        open={isCharacterModalOpen}
        setOpen={setIsCharacterModalOpen}
        collectionUuid={collectionUuid}
        character={selectedCharacter!}
      />
      <DeleteCharacterModal
        open={isDeleteCharacterModalOpen}
        setOpen={setIsDeleteCharacterModalOpen}
        collectionUuid={collectionUuid}
        character={selectedCharacter!}
      />
    </>
  );
}
