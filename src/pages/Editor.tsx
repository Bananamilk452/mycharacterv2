import { useParams } from "crossroad";

function Editor() {
  const { collectionUuid } = useParams("/editor/:collectionUuid");

  return (
    <div>
      <h1>Editor {collectionUuid}</h1>
    </div>
  );
}

export default Editor;
