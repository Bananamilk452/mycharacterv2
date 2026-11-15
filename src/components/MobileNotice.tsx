import { SmartphoneIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Note } from "@/components/ui/note";
import { useIsMobile } from "@/hooks/use-mobile";

const DISMISSED_STORAGE_KEY = "mc-mobile-notice-dismissed";

export function MobileNotice() {
  const isMobile = useIsMobile();
  const [isDismissed, setIsDismissed] = useState(
    () => localStorage.getItem(DISMISSED_STORAGE_KEY) === "true",
  );

  function dismiss() {
    localStorage.setItem(DISMISSED_STORAGE_KEY, "true");
    setIsDismissed(true);
  }

  if (!isMobile || isDismissed) {
    return null;
  }

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      data-testid="mobile-notice"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-notice-title"
        className="grid w-full max-w-lg gap-4 rounded-lg border bg-background p-6 shadow-lg"
      >
        <h2 id="mobile-notice-title" className="flex items-center gap-2 text-lg font-semibold">
          <SmartphoneIcon className="size-5" />
          모바일 환경 안내
        </h2>
        <p className="text-sm text-muted-foreground">
          마이자캐는 현재 PC 환경에 최적화되어 있습니다. 모바일에서는 일부 기능이 정상적으로
          동작하지 않을 수 있습니다.
        </p>

        <Note variant="danger">
          원활한 사용을 위해 데스크톱 또는 노트북의 크롬, 엣지, 사파리에서 이용해주세요.
        </Note>

        <div className="flex justify-end">
          <Button onClick={dismiss} data-testid="mobile-notice-confirm-button">
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}
