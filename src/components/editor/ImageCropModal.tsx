import { useState } from "react";
import ReactCrop, { Crop } from "react-image-crop";

import "react-image-crop/dist/ReactCrop.css";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "../ui/button";

interface ImageCropModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  image: Blob | undefined;
  onComplete: (croppedImage: Blob) => void;
}

export function ImageCropModal({
  open,
  setOpen,
  image,
  onComplete,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [previousState, setPreviousState] = useState(open);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const imageUrl = image ? URL.createObjectURL(image) : undefined;

  if (open !== previousState) {
    setPreviousState(open);
    setCrop(undefined);
  }

  function onSave() {
    if (!imgElement || !crop || !crop.width || !crop.height) {
      return;
    }

    const canvas = document.createElement("canvas");
    const scaleX = imgElement.naturalWidth / imgElement.width;
    const scaleY = imgElement.naturalHeight / imgElement.height;

    canvas.width = crop.width;
    canvas.height = crop.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.drawImage(
      imgElement,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    );

    canvas.toBlob((blob) => {
      if (blob) {
        onComplete(blob);
        setOpen(false);
      }
    }, "image/webp");
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl!">
        <DialogHeader>
          <DialogTitle>이미지 자르기</DialogTitle>
        </DialogHeader>

        <ReactCrop crop={crop} onChange={(newCrop) => setCrop(newCrop)}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt="To be cropped"
              onLoad={(e) => setImgElement(e.currentTarget)}
            />
          )}
        </ReactCrop>

        <DialogFooter>
          <Button onClick={onSave}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
