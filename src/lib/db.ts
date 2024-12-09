import { Dexie, type EntityTable } from "dexie";

interface Character {
  id: number;
  name: string;
  property: string[][];
  image: Blob;
}

const db = new Dexie("CharacterDatabase") as Dexie & {
  character: EntityTable<
    Character,
    "id" // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  character: "++id, name, *property", // primary key "id" (for the runtime!)
});

export type { Character };
export { db };
