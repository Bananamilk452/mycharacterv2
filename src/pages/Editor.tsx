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
  const { ready, collectionInfo, characters } = useCollection(
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

  return (
    <main>
      {ready ? (
        <>
          <SidebarProvider>
            <AppSidebar uuid={collectionUuid as string} />
            <section id="characters" className="p-4">
              <ul className="flex flex-wrap gap-4">
                {characters?.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
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
