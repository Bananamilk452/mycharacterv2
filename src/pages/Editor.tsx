import { useParams } from "crossroad";
import { useEffect, useState } from "react";

import { AppSidebar } from "@/components/editor/AppSidebar";
import { CharacterCard } from "@/components/editor/CharacterCard";
import { CharacterModal } from "@/components/editor/CharacterModal";
import { Spinner } from "@/components/Spinner";
import { Dimmer } from "@/components/ui/dimmer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useCollection } from "@/hooks/useCollection";
import { Character } from "@/lib/db";

function Editor() {
  const { collectionUuid } = useParams();
  const { collectionInfo, characters } = useCollection(
    collectionUuid as string,
  );
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] =
    useState<Character | null>();

  useEffect(() => {
    if (collectionInfo) {
      document.title = `${collectionInfo.name} - 마이자캐v2`;
    }
  }, [collectionInfo]);

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
        }
      });
    }
    return description;
  }

  return (
    <main>
      {characters && collectionInfo ? (
        <>
          <SidebarProvider>
            <AppSidebar uuid={collectionUuid as string} />
            <section id="characters" className="p-4">
              <ul className="flex flex-wrap gap-4">
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
              </ul>
              <CharacterModal
                open={isCharacterModalOpen}
                setOpen={setIsCharacterModalOpen}
                collectionUuid={collectionUuid as string}
                character={selectedCharacter!}
              />
            </section>
          </SidebarProvider>
        </>
      ) : (
        <Dimmer>
          <div className="flex flex-col items-center gap-2">
            <Spinner className="size-6" />
            <p className="text-sm">로딩 중...</p>
          </div>
        </Dimmer>
      )}
    </main>
  );
}

export default Editor;
