import { useLiveQuery } from "dexie-react-hooks";
import { ImagesIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { useCollection } from "@/hooks/useCollection";
import { Collection, GalleryImage } from "@/lib/db";
import { cn, updateCollectionUpdatedAt } from "@/lib/utils";

function useBlobUrl(blob: Blob | undefined) {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : undefined), [blob]);
  const currentUrlRef = useRef<string | undefined>(url);

  useEffect(() => {
    currentUrlRef.current = url;

    return () => {
      currentUrlRef.current = undefined;
      const cleanupUrl = url;

      if (!cleanupUrl) {
        return;
      }

      // StrictMode의 effect 재실행 중에는 같은 URL이 다시 사용되므로,
      // 실제로 URL이 교체되거나 언마운트된 경우에만 해제한다.
      queueMicrotask(() => {
        if (currentUrlRef.current !== cleanupUrl) {
          URL.revokeObjectURL(cleanupUrl);
        }
      });
    };
  }, [url]);

  return url;
}

interface GalleryUploadButtonProps {
  collection: Collection | undefined;
  collectionUuid: string;
  characterId?: string;
  inputTestId: string;
  buttonTestId: string;
}

function GalleryUploadButton({
  collection,
  collectionUuid,
  characterId,
  inputTestId,
  buttonTestId,
}: GalleryUploadButtonProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!collection || files.length === 0) {
      return;
    }

    setIsUploading(true);

    try {
      for (const file of files) {
        await collection.gallery.add({
          characterId,
          image: file,
          createdAt: new Date(),
        });
      }
      await updateCollectionUpdatedAt(collectionUuid);
      toast.success("갤러리에 이미지를 추가했습니다.");
    } catch (error) {
      console.error(error);
      toast.error("이미지 추가에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg, image/png, image/gif, image/webp, image/avif"
        multiple
        hidden
        onChange={handleFiles}
        data-testid={inputTestId}
      />
      <Button
        type="button"
        size="sm"
        disabled={isUploading || !collection}
        onClick={() => fileRef.current?.click()}
        data-testid={buttonTestId}
      >
        <UploadIcon />
        이미지 추가
      </Button>
    </>
  );
}

function GalleryThumbnail({
  image,
  index,
  testIdPrefix,
  onOpen,
  onDelete,
}: {
  image: GalleryImage;
  index: number;
  testIdPrefix: string;
  onOpen: (image: GalleryImage) => void;
  onDelete: (image: GalleryImage) => void;
}) {
  const url = useBlobUrl(image.image);

  return (
    <li className="group relative aspect-square overflow-hidden rounded-md border bg-gray-50 shadow-sm">
      <button
        type="button"
        className="size-full"
        onClick={() => onOpen(image)}
        aria-label={`갤러리 이미지 ${index + 1} 크게 보기`}
        data-testid={`${testIdPrefix}-image-${index}`}
      >
        <img
          src={url}
          alt={`갤러리 이미지 ${index + 1}`}
          className="size-full object-cover transition-transform group-hover:scale-105"
        />
      </button>
      <Button
        type="button"
        variant="destructive"
        size="icon-sm"
        className="absolute top-1 right-1 shadow"
        aria-label={`갤러리 이미지 ${index + 1} 삭제`}
        onClick={() => onDelete(image)}
        data-testid={`${testIdPrefix}-delete-${index}`}
      >
        <Trash2Icon />
      </Button>
    </li>
  );
}

function GalleryLightbox({
  image,
  onClose,
}: {
  image: GalleryImage | null;
  onClose: () => void;
}) {
  const url = useBlobUrl(image?.image);

  return (
    <Dialog open={Boolean(image)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl! p-2">
        <DialogTitle className="sr-only">갤러리 이미지 보기</DialogTitle>
        {image && (
          <img
            src={url}
            alt="갤러리 이미지 크게 보기"
            className="max-h-[80dvh] w-full object-contain"
            data-testid="gallery-lightbox-image"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface GalleryContentProps {
  collection: Collection | undefined;
  collectionUuid: string;
  characterId?: string;
  testIdPrefix: string;
  columnsClass?: string;
  emptyText: string;
}

function GalleryContent({
  collection,
  collectionUuid,
  characterId,
  testIdPrefix,
  columnsClass = "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6",
  emptyText,
}: GalleryContentProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const images = useLiveQuery(async () => {
    if (!collection) {
      return [];
    }

    if (characterId) {
      return await collection.gallery.where("characterId").equals(characterId).toArray();
    }

    return await collection.gallery.filter((image) => !image.characterId).toArray();
  }, [collection, characterId]);

  async function handleDelete(image: GalleryImage) {
    if (!collection) {
      return;
    }

    try {
      await collection.gallery.delete(image.id);
      await updateCollectionUpdatedAt(collectionUuid);
      toast.success("이미지를 삭제했습니다.");
    } catch (error) {
      console.error(error);
      toast.error("이미지 삭제에 실패했습니다.");
    }
  }

  if (!images || images.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-600" data-testid={`${testIdPrefix}-empty`}>
        {emptyText}
      </p>
    );
  }

  return (
    <>
      <ul className={cn("grid gap-3", columnsClass)}>
        {images.map((image, index) => (
          <GalleryThumbnail
            key={image.id}
            image={image}
            index={index}
            testIdPrefix={testIdPrefix}
            onOpen={setSelectedImage}
            onDelete={handleDelete}
          />
        ))}
      </ul>
      <GalleryLightbox image={selectedImage} onClose={() => setSelectedImage(null)} />
    </>
  );
}

export function CollectionGallery({ collectionUuid }: { collectionUuid: string }) {
  const { collection } = useCollection(collectionUuid);

  return (
    <section id="gallery" className="size-full overflow-y-auto p-4" data-testid="collection-gallery">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ImagesIcon className="size-5" />
            갤러리
          </h2>
          <p className="mt-1 text-sm text-gray-600">콜렉션과 관련된 이미지를 모아둘 수 있습니다.</p>
        </div>
        <GalleryUploadButton
          collection={collection}
          collectionUuid={collectionUuid}
          inputTestId="collection-gallery-upload-input"
          buttonTestId="collection-gallery-upload-button"
        />
      </div>

      <GalleryContent
        collection={collection}
        collectionUuid={collectionUuid}
        testIdPrefix="collection-gallery"
        emptyText="콜렉션 갤러리에 저장된 이미지가 없습니다."
      />
    </section>
  );
}

export function CharacterGallery({
  collectionUuid,
  characterId,
}: {
  collectionUuid: string;
  characterId?: string;
}) {
  const { collection } = useCollection(collectionUuid);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <Label>갤러리</Label>
        {characterId && (
          <GalleryUploadButton
            collection={collection}
            collectionUuid={collectionUuid}
            characterId={characterId}
            inputTestId="character-gallery-upload-input"
            buttonTestId="character-gallery-upload-button"
          />
        )}
      </div>

      {characterId ? (
        <div className="mt-3">
          <GalleryContent
            collection={collection}
            collectionUuid={collectionUuid}
            characterId={characterId}
            testIdPrefix="character-gallery"
            columnsClass="grid-cols-3 sm:grid-cols-5"
            emptyText="캐릭터 갤러리에 저장된 이미지가 없습니다."
          />
        </div>
      ) : (
        <p className="mt-3 rounded-md border border-input p-3 text-sm text-gray-600">
          캐릭터를 저장한 뒤 갤러리에 사진을 추가할 수 있습니다.
        </p>
      )}
    </div>
  );
}
