import { AppSidebar } from "@/components/AppSidebar";
import { CharacterCard } from "@/components/CharacterCard";
import { Dimmer } from "@/components/ui/dimmer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Spinner } from "@/components/Spinner";
import { useCollection } from "@/hooks/useCollection";
import { useParams } from "crossroad";

function Editor() {
  const { collectionUuid } = useParams("/editor/:collectionUuid") as {
    collectionUuid: string;
  };
  const { ready, collection, collectionInfo, characters } =
    useCollection(collectionUuid);

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
            <Spinner className="size-6 text-white" />
            <p className="text-sm text-white">로딩 중...</p>
          </div>
        </Dimmer>
      )}
    </main>
  );
}

export default Editor;
