import { useParams } from "crossroad";

import { AppSidebar } from "@/components/editor/AppSidebar";
import { CharacterCard } from "@/components/editor/CharacterCard";
import { Spinner } from "@/components/Spinner";
import { Dimmer } from "@/components/ui/dimmer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useCollection } from "@/hooks/useCollection";

function Editor() {
  const { collectionUuid } = useParams();
  const { ready, collection, collectionInfo, characters } = useCollection(
    collectionUuid as string,
  );

  return (
    <main>
      {ready ? (
        <>
          <SidebarProvider>
            <AppSidebar
              collection={collection!}
              collectionInfo={collectionInfo!}
              characters={characters!}
            />
            <section id="characters" className="p-4">
              <ul className="flex flex-wrap gap-4">
                {characters?.map((character) => (
                  <CharacterCard key={character.id} character={character} />
                ))}
              </ul>
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
