import FileSaver from "file-saver";
import { toPng } from "html-to-image";
import { ImageIcon, PaletteIcon, SaveIcon, Trash2Icon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useCollection } from "@/hooks/useCollection";
import { applyCharacterDescriptionTemplate, htmlToPlainText } from "@/lib/character";
import { Character } from "@/lib/db";
import { cn } from "@/lib/utils";

const BACKGROUND_COLORS = [
  { label: "먹색", value: "#0f172a" },
  { label: "보라", value: "#6d28d9" },
  { label: "로즈", value: "#be123c" },
  { label: "청록", value: "#0f766e" },
  { label: "호박", value: "#b45309" },
  { label: "남색", value: "#1d4ed8" },
  { label: "자주", value: "#86198f" },
  { label: "숲", value: "#166534" },
];

function useBlobDataUrl(blob: Blob | undefined) {
  const [loaded, setLoaded] = useState<{ blob: Blob; dataUrl: string } | undefined>();

  useEffect(() => {
    if (!blob) {
      return;
    }

    let isCancelled = false;
    const reader = new FileReader();

    reader.onload = () => {
      if (!isCancelled) {
        setLoaded({ blob, dataUrl: reader.result as string });
      }
    };
    reader.readAsDataURL(blob);

    return () => {
      isCancelled = true;
    };
  }, [blob]);

  if (!blob || loaded?.blob !== blob) {
    return undefined;
  }

  return loaded.dataUrl;
}

interface CharacterCardModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  collectionUuid: string;
  character: Character;
}

export function CharacterCardModal({
  open,
  setOpen,
  collectionUuid,
  character,
}: CharacterCardModalProps) {
  const { collectionInfo, characters } = useCollection(collectionUuid);
  const cardRef = useRef<HTMLDivElement>(null);
  const backgroundFileRef = useRef<HTMLInputElement>(null);

  const [backgroundColor, setBackgroundColor] = useState(BACKGROUND_COLORS[0].value);
  const [backgroundImage, setBackgroundImage] = useState<Blob | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const avatarDataUrl = useBlobDataUrl(character.avatar);
  const backgroundImageDataUrl = useBlobDataUrl(backgroundImage);

  const description = useMemo(() => {
    if (!collectionInfo?.characterDescription) {
      return "";
    }

    return applyCharacterDescriptionTemplate(collectionInfo.characterDescription, character);
  }, [collectionInfo, character]);

  const noteText = useMemo(() => htmlToPlainText(character.note), [character.note]);

  const relations = useMemo(() => {
    return (character.relationKeys ?? [])
      .map((key, index) => {
        const relationCharacter = characters?.find((c) => c.id === key);

        if (!relationCharacter) {
          return undefined;
        }

        return {
          name: relationCharacter.name,
          relationName: character.relationValues[index],
        };
      })
      .filter((relation) => relation !== undefined);
  }, [character.relationKeys, character.relationValues, characters]);

  const properties = (character.propertyKeys ?? []).map((key, index) => ({
    key,
    value: character.propertyValues[index],
  }));

  const visibleProperties = properties.slice(0, 8);

  function handleBackgroundFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (file) {
      setBackgroundImage(file);
    }
  }

  async function handleSave() {
    if (!cardRef.current) {
      return;
    }

    setIsSaving(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: false,
        skipFonts: true,
      });
      const fileName = `${character.name.replace(/[\\/:*?"<>|]/g, "_")}-카드.png`;

      FileSaver.saveAs(dataUrl, fileName);
      toast.success("캐릭터 카드를 저장했습니다.");
    } catch (error) {
      console.error(error);
      toast.error("캐릭터 카드 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[calc(100dvh-32px)]! max-w-[1080px]! overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="size-5" />
            캐릭터 카드
          </DialogTitle>
          <DialogDescription>
            캐릭터의 프로필, 설명, 관계를 한 장의 카드로 확인하고 PNG로 저장할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-3 rounded-md border p-3">
          <div className="flex items-center gap-2">
            <PaletteIcon className="size-4 text-gray-500" />
            <Label>배경색</Label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {BACKGROUND_COLORS.map((color, index) => (
              <button
                key={color.value}
                type="button"
                className={cn(
                  "size-7 rounded-full border-2 border-white shadow ring-offset-2 transition",
                  !backgroundImage && backgroundColor === color.value
                    ? "ring-2 ring-ring"
                    : "ring-0",
                )}
                style={{ backgroundColor: color.value }}
                aria-label={`배경색 ${color.label}`}
                title={color.label}
                onClick={() => {
                  setBackgroundImage(undefined);
                  setBackgroundColor(color.value);
                }}
                data-testid={`character-card-color-${index}`}
              />
            ))}
          </div>

          <input
            ref={backgroundFileRef}
            type="file"
            accept="image/jpeg, image/png, image/gif, image/webp, image/avif"
            hidden
            onChange={handleBackgroundFile}
            data-testid="character-card-background-input"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => backgroundFileRef.current?.click()}
            data-testid="character-card-background-button"
          >
            <ImageIcon />
            배경 이미지
          </Button>
          {backgroundImage && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setBackgroundImage(undefined)}
              data-testid="character-card-background-remove"
            >
              <Trash2Icon />
              이미지 제거
            </Button>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl">
          <div
            ref={cardRef}
            className="relative h-[600px] w-[1000px] shrink-0 overflow-hidden rounded-2xl text-white shadow-2xl"
            style={
              backgroundImageDataUrl
                ? {
                    backgroundImage: `url(${backgroundImageDataUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : { backgroundColor }
            }
            data-background-type={backgroundImageDataUrl ? "image" : "color"}
            data-testid="character-card-preview"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/50" />
            {backgroundImageDataUrl && <div className="absolute inset-0 bg-slate-950/60" />}

            <div className="relative flex h-full flex-col p-10">
              <div className="flex items-center justify-between text-[11px] font-medium tracking-[0.3em] text-white/70">
                <span>{collectionInfo?.name ?? "MY CHARACTER"}</span>
                <span>CHARACTER CARD</span>
              </div>

              <div className="mt-6 flex min-h-0 flex-1 gap-10">
                <div className="flex w-60 shrink-0 flex-col items-center">
                  {avatarDataUrl ? (
                    <img
                      src={avatarDataUrl}
                      alt={character.name}
                      className="size-60 rounded-2xl border-4 border-white/30 object-cover shadow-2xl"
                    />
                  ) : (
                    <div className="flex size-60 items-center justify-center rounded-2xl border-4 border-white/30 bg-white/10 text-7xl font-bold shadow-2xl">
                      {character.name.slice(0, 1)}
                    </div>
                  )}

                  {character.tags.length > 0 && (
                    <div className="mt-5 flex max-h-24 flex-wrap justify-center gap-2 overflow-hidden">
                      {character.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs text-white/90"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <h2 className="text-5xl font-bold tracking-tight drop-shadow-lg">
                    {character.name}
                  </h2>

                  {description && (
                    <p className="mt-4 line-clamp-4 text-base leading-relaxed whitespace-pre-wrap text-white/85">
                      {description}
                    </p>
                  )}

                  {visibleProperties.length > 0 && (
                    <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2">
                      {visibleProperties.map((property, index) => (
                        <div
                          key={`${property.key}-${index}`}
                          className="min-w-0 border-l-2 border-white/30 pl-3"
                        >
                          <p className="text-[10px] tracking-wider text-white/60 uppercase">
                            {property.key}
                          </p>
                          <p className="truncate text-sm font-medium">{property.value}</p>
                        </div>
                      ))}
                      {properties.length > visibleProperties.length && (
                        <p className="text-xs text-white/60">
                          +{properties.length - visibleProperties.length}개 속성
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-auto flex flex-col gap-3">
                    {relations.length > 0 && (
                      <div>
                        <p className="text-[10px] tracking-[0.2em] text-white/60 uppercase">관계</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {relations.slice(0, 6).map((relation, index) => (
                            <span
                              key={`${relation.name}-${index}`}
                              className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs"
                            >
                              {relation.name} · {relation.relationName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {noteText && (
                      <p className="line-clamp-3 rounded-xl border border-white/15 bg-black/25 p-3 text-xs leading-relaxed text-white/80">
                        {noteText}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            data-testid="character-card-save-button"
          >
            <SaveIcon />
            {isSaving ? "저장 중..." : "PNG로 저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
