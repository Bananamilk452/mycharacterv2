import { useMemo } from "react";

import { Character } from "@/lib/db";

interface Props {
  character: Character;
}

export function CharacterCard({ character }: Props) {
  const avatarUrl = useMemo(() => {
    if (character.avatar) {
      return URL.createObjectURL(character.avatar);
    }
    return "/default-avatar.png";
  }, [character.avatar]);

  return (
    <button className="flex flex-col items-start gap-2 rounded-md border bg-gray-50 p-4 shadow">
      <img
        className="flex size-32 items-center justify-center rounded-md bg-white object-contain text-sm"
        src={avatarUrl}
        alt={character.name}
      />
      <h2 className="text-sm font-medium">{character.name}</h2>
    </button>
  );
}
