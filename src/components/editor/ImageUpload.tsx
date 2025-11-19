import { Trash2Icon, UploadIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { Button } from "../ui/button";
import { ImageCropModal } from "./ImageCropModal";

export function ImageUpload({
  blob,
  setBlob,
}: {
  blob: Blob | undefined;
  setBlob: (blob: Blob | undefined) => void;
}) {
  const [isImageCropModalOpen, setIsImageCropModalOpen] = useState(false);
  const [file, setFile] = useState<Blob | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);
  const blobUrl = useMemo(() => {
    if (blob) {
      return URL.createObjectURL(blob);
    }
    return undefined;
  }, [blob]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    if (files && files.length > 0) {
      setFile(files[0]);
      setIsImageCropModalOpen(true);
      fileRef.current!.value = "";
    }
  }

  function handleRemoveAvatar() {
    setBlob(undefined);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="aspect-square w-full overflow-hidden rounded-lg border">
        <img
          src={blobUrl}
          alt="이미지가 없습니다."
          className="flex size-full items-center justify-center object-cover text-sm"
        />
      </div>
      <div className="flex justify-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg, image/png, image/gif, image/webp, image/avif"
          hidden
          onChange={handleFileChange}
        />
        <Button
          type="button"
          className="size-9"
          onClick={() => fileRef.current?.click()}
        >
          <UploadIcon />
        </Button>
        <Button
          type="button"
          variant="destructive"
          className="size-9"
          onClick={handleRemoveAvatar}
        >
          <Trash2Icon />
        </Button>
      </div>

      <ImageCropModal
        open={isImageCropModalOpen}
        setOpen={setIsImageCropModalOpen}
        image={file}
        onComplete={(blob) => setBlob(blob)}
      />
    </div>
  );
}
