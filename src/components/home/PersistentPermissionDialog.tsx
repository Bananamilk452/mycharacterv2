import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Message } from "@/components/ui/message";
import { Note } from "@/components/ui/note";
import { usePersistentStorage } from "@/hooks/usePersistentStorage";

export function PersistentPermissionDialog() {
  const { ready, isPersistent, persist } = usePersistentStorage();

  const [isOpen, setIsOpen] = useState(false);
  const [isPersistRequested, setPersistRequested] = useState(false);

  function handlePersist() {
    setPersistRequested(true);
    persist();
  }

  function handleOpen(open: boolean) {
    setIsOpen(open);
  }

  useEffect(() => {
    if (ready) {
      setIsOpen(!isPersistent);
    }
  }, [ready]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>영구 스토리지 권한 요청</DialogTitle>
          <DialogDescription>
            안전한 데이터의 저장을 위해 영구 스토리지 권한이 필요합니다. (크롬의
            경우에는 알림 권한도 함께 요청될 수 있습니다.)
          </DialogDescription>
        </DialogHeader>
        <Note variant="danger">
          '시크릿 모드'나 '사생활 보호 모드'에서 마이자캐를 사용하지 마세요.
          브라우저 종료 시 데이터가 유실됩니다.
        </Note>
        {isPersistRequested &&
          (isPersistent ? (
            <Message variant="success">
              영구 스토리지 권한이 허용되었습니다.
            </Message>
          ) : (
            <Message variant="error">
              영구 스토리지 권한 요청에 실패했습니다. 페이지를 새로고침 하거나
              사이트를 북마크 한 후 다시 시도해보세요.
            </Message>
          ))}
        <DialogFooter>
          <Button onClick={handlePersist}>영구 스토리지 권한 요청</Button>
          {isPersistent && (
            <Button onClick={() => handleOpen(false)}>
              마이자캐 시작하기!
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
