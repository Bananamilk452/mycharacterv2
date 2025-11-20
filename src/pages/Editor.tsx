import { useParams } from "crossroad";
import { useEffect } from "react";

import { AppSidebar } from "@/components/editor/AppSidebar";
import { Characters } from "@/components/editor/Characters";
import { Spinner } from "@/components/Spinner";
import { Dimmer } from "@/components/ui/dimmer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useCollection } from "@/hooks/useCollection";

function Editor() {
  const { collectionUuid } = useParams();
  const { collectionInfo, characters } = useCollection(
    collectionUuid as string,
  );

  useEffect(() => {
    if (collectionInfo) {
      document.title = `${collectionInfo.name} - 마이자캐v2`;
    }
  }, [collectionInfo]);

  return (
    <main>
      {characters && collectionInfo ? (
        <>
          <SidebarProvider>
            <AppSidebar uuid={collectionUuid as string} />
            <Characters collectionUuid={collectionUuid as string} />
          </SidebarProvider>
        </>
      ) : (
        <Dimmer>
          <div className="flex flex-col items-center gap-2">
            <Spinner className="size-6" />
            <p className="text-sm">로딩 중...</p>
          </div>
        </Dimmer>
      )}
    </main>
  );
}

export default Editor;
