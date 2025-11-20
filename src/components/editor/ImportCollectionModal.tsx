import { usePath } from "crossroad";
import { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { importCollection } from "@/lib/db/import";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Message } from "../ui/message";

interface ImportCollectionModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function ImportCollectionModal({
  open,
  setOpen,
}: ImportCollectionModalProps) {
  const [, setPath] = usePath();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  function onImport() {
    if (!file) {
      return;
    }

    setIsLoading(true);

    importCollection(file)
      .then(({ uuid }) => {
        setOpen(false);
        toast.success("콜렉션을 성공적으로 가져왔습니다.");
        setPath(`/editor/${uuid}`);
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message || "콜렉션 가져오기에 실패했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>콜렉션 가져오기</DialogTitle>
        </DialogHeader>

        <p>내보낸 콜렉션의 ZIP 파일을 선택하여 가져옵니다.</p>
        <Input
          type="file"
          disabled={isLoading}
          accept=".zip"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0] || null;
            setFile(selectedFile);
          }}
        />

        <DialogFooter>
          {isLoading && <Message variant="loading">가져오는 중...</Message>}

          <Button disabled={isLoading || !file} onClick={onImport}>
            가져오기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
