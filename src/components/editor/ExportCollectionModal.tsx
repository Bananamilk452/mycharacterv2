import FileSaver from "file-saver";
import { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DB_PREFIX } from "@/constant";
import { exportCollection } from "@/lib/db/export";

import { Button } from "../ui/button";
import { Message } from "../ui/message";

interface ExportCollectionModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  collectionUuid: string;
}

export function ExportCollectionModal({
  open,
  setOpen,
  collectionUuid,
}: ExportCollectionModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  function onExport() {
    setIsLoading(true);

    exportCollection(`${DB_PREFIX}${collectionUuid}`)
      .then(({ file, name }) => {
        FileSaver.saveAs(file, name);
        setOpen(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("콜렉션 내보내기에 실패했습니다.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>콜렉션 내보내기</DialogTitle>
        </DialogHeader>

        <p>콜렉션을 ZIP 파일로 내보냅니다. 약간의 시간이 걸릴 수 있습니다.</p>

        <DialogFooter>
          {isLoading && <Message variant="loading">내보내는 중...</Message>}

          <Button disabled={isLoading} onClick={onExport}>
            내보내기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
