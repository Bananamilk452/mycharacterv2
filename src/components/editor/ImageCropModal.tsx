import { useEffect, useState } from "react";
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
  const [aspect, setAspect] = useState<number | undefined>(1);
  const [previousState, setPreviousState] = useState(open);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const imageUrl = image ? URL.createObjectURL(image) : undefined;

  useEffect(() => {
    if (imgElement) {
      setCrop({
        width: imgElement.width,
        height: imgElement.height,
        x: 0,
        y: 0,
        unit: "px",
      });
    }
  }, [imgElement]);

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
    canvas.width = Math.ceil(crop.width * scaleX);
    canvas.height = Math.ceil(crop.height * scaleY);
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
      crop.width * scaleX,
      crop.height * scaleY,
    );

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onComplete(blob);
          setOpen(false);
        }
      },
      "image/webp",
      0.9,
    );
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-[calc(100dvh-48px)]! w-fit max-w-[calc(100dvw-48px)]! flex-col">
        <DialogHeader>
          <DialogTitle>이미지 자르기</DialogTitle>
        </DialogHeader>

        <ReactCrop
          className="max-h-[80vh]"
          crop={crop}
          aspect={aspect}
          onChange={(newCrop) => setCrop(newCrop)}
        >
          {imageUrl && (
            <img
              className="h-fit"
              src={imageUrl}
              alt="To be cropped"
              onLoad={(e) => setImgElement(e.currentTarget)}
            />
          )}
        </ReactCrop>

        <DialogFooter>
          <Button variant="outline" onClick={() => setAspect(undefined)}>
            자유 비율
          </Button>
          <Button variant="outline" onClick={() => setAspect(1)}>
            1:1 비율
          </Button>
          <Button onClick={onSave}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
