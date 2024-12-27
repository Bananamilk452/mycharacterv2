import { CharacterCard } from "@/components/CharacterCard";
import { CharacterDialog } from "@/components/CharacterDialog";
import { Button } from "@/components/ui/Button";
import { Dimmer } from "@/components/ui/Dimmer";
import { Spinner } from "@/components/ui/Spinner";
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
          <h1>Editor {collectionUuid}</h1>
          <div>
            Collection: <pre>{JSON.stringify(collectionInfo, null, 2)}</pre>
          </div>
          <div>My characters: {characters?.length}</div>

          <section id="characters" className="flex flex-wrap gap-4">
            {characters?.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </section>

          <CharacterDialog collection={collection!}>
            <Button>캐릭터 생성</Button>
          </CharacterDialog>
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
