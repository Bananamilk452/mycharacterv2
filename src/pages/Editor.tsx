import { CharacterDialog } from "@/components/CharacterDialog";
import { Button } from "@/components/ui/Button";
import { useCollection } from "@/hooks/useCollection";
import { useParams } from "crossroad";

function Editor() {
  const { collectionUuid } = useParams("/editor/:collectionUuid");
  const { collection, collectionInfo, characters } =
    useCollection(collectionUuid);

  return (
    <div>
      <h1>Editor {collectionUuid}</h1>
      <div>
        Collection: <pre>{JSON.stringify(collectionInfo, null, 2)}</pre>
      </div>
      <div>My characters: {characters?.length}</div>
      <div>
        Data: <pre>{JSON.stringify(characters, null, 2)}</pre>
      </div>

      <CharacterDialog collection={collection!}>
        <Button>캐릭터 생성</Button>
      </CharacterDialog>
    </div>
  );
}

export default Editor;
