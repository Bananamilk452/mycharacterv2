import { useEffect, useMemo, useState } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImageCropModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  image: Blob | undefined;
  onComplete: (croppedImage: Blob) => void;
}

/**
 * 주어진 영역 안에 들어가는, 지정한 비율의 중앙 정렬된 크롭 영역을 만든다.
 * aspect가 없으면 이미지 전체를 크롭 영역으로 사용한다.
 */
function createCrop(width: number, height: number, aspect: number | undefined): Crop {
  if (!aspect) {
    return { unit: "px", x: 0, y: 0, width, height };
  }

  let cropWidth = width;
  let cropHeight = width / aspect;

  if (cropHeight > height) {
    cropHeight = height;
    cropWidth = height * aspect;
  }

  return {
    unit: "px",
    x: (width - cropWidth) / 2,
    y: (height - cropHeight) / 2,
    width: cropWidth,
    height: cropHeight,
  };
}

export function ImageCropModal({ open, setOpen, image, onComplete }: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [aspect, setAspect] = useState<number | undefined>(1);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  // 렌더링마다 새로운 object URL을 만들면 img가 매번 다시 로드되면서
  // onLoad가 크롭 영역을 초기화해버린다. 이미지가 바뀔 때만 URL을 만든다.
  const imageUrl = useMemo(() => (image ? URL.createObjectURL(image) : undefined), [image]);

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  // 모달이 닫히면 다음에 열 때 이미지 로드(onLoad) 시점에 크롭이 다시 초기화된다.

  function handleImageLoad(event: React.SyntheticEvent<HTMLImageElement>) {
    const element = event.currentTarget;
    const { width, height } = element.getBoundingClientRect();
    setImgElement(element);
    setCrop(createCrop(width, height, aspect));
  }

  function handleAspectChange(nextAspect: number | undefined) {
    setAspect(nextAspect);

    if (!imgElement) {
      return;
    }

    const { width, height } = imgElement.getBoundingClientRect();
    setCrop(createCrop(width, height, nextAspect));
  }

  function onSave() {
    if (!imgElement || !crop || !crop.width || !crop.height) {
      return;
    }

    const { width, height } = imgElement.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    const scaleX = imgElement.naturalWidth / width;
    const scaleY = imgElement.naturalHeight / height;
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
            <img className="h-fit" src={imageUrl} alt="To be cropped" onLoad={handleImageLoad} />
          )}
        </ReactCrop>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleAspectChange(undefined)}>
            자유 비율
          </Button>
          <Button variant="outline" onClick={() => handleAspectChange(1)}>
            1:1 비율
          </Button>
          <Button onClick={onSave}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
