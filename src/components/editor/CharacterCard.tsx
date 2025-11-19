import { cva, VariantProps } from "class-variance-authority";
import { useMemo } from "react";

import { Character } from "@/lib/db";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "flex flex-col items-start gap-2 rounded-md border bg-gray-50 shadow",
  {
    variants: {
      size: {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const imageVariants = cva(
  "flex items-center justify-center rounded-md bg-white object-contain text-sm",
  {
    variants: {
      size: {
        sm: "size-24",
        md: "size-32",
        lg: "size-40",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

type CharacterCardProps = {
  character: Character;
  description?: string;
} & React.HTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof cardVariants>;

export function CharacterCard(props: CharacterCardProps) {
  const { character, size, ...rest } = props;
  const avatarUrl = useMemo(() => {
    if (character.avatar) {
      return URL.createObjectURL(character.avatar);
    }
    return "/default-avatar.png";
  }, [character.avatar]);

  return (
    <button {...rest} className={cn(cardVariants({ size }), rest.className)}>
      <CharacterImage size={size} src={avatarUrl} alt={character.name} />
      <h2 className="text-sm font-medium">{character.name}</h2>
      <p className="text-xs text-gray-600">{props.description}</p>
    </button>
  );
}

function CharacterImage({
  src,
  alt,
  size,
}: { src: string; alt: string } & VariantProps<typeof imageVariants>) {
  return <img className={cn(imageVariants({ size }))} src={src} alt={alt} />;
}
