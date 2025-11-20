import { useParams, usePath } from "crossroad";
import { useEffect, useState } from "react";

import { AppSidebar } from "@/components/editor/AppSidebar";
import { Characters } from "@/components/editor/Characters";
import { ExportCollectionModal } from "@/components/editor/ExportCollectionModal";
import { CreateCollectionDialog } from "@/components/home/CreateCollectionDialog";
import { OpenCollectionModal } from "@/components/home/OpenCollectionModal";
import { Spinner } from "@/components/Spinner";
import { Dimmer } from "@/components/ui/dimmer";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useCollection } from "@/hooks/useCollection";

function Editor() {
  const [, setPath] = usePath();
  const { collectionUuid } = useParams();
  const { collectionInfo, characters } = useCollection(
    collectionUuid as string,
  );

  const [isCreateCollectionDialogOpen, setIsCreateCollectionDialogOpen] =
    useState(false);
  const [isOpenCollectionDialogOpen, setIsOpenCollectionDialogOpen] =
    useState(false);
  const [isExportCollectionDialogOpen, setIsExportCollectionDialogOpen] =
    useState(false);

  useEffect(() => {
    if (collectionInfo) {
      document.title = `${collectionInfo.name} - 마이자캐v2`;
    }
  }, [collectionInfo]);

  return (
    <main>
      {characters && collectionInfo ? (
        <>
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>파일</MenubarTrigger>
              <MenubarContent>
                <MenubarItem onClick={() => setPath("/")}>홈</MenubarItem>
                <MenubarItem
                  onClick={() => setIsCreateCollectionDialogOpen(true)}
                >
                  콜렉션 추가
                </MenubarItem>
                <MenubarItem
                  onClick={() => setIsOpenCollectionDialogOpen(true)}
                >
                  콜렉션 열기
                </MenubarItem>
                <MenubarItem
                  onClick={() => setIsExportCollectionDialogOpen(true)}
                >
                  내보내기
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          <CreateCollectionDialog
            open={isCreateCollectionDialogOpen}
            setOpen={setIsCreateCollectionDialogOpen}
          />
          <OpenCollectionModal
            open={isOpenCollectionDialogOpen}
            setOpen={setIsOpenCollectionDialogOpen}
          />
          <ExportCollectionModal
            open={isExportCollectionDialogOpen}
            setOpen={setIsExportCollectionDialogOpen}
            collectionUuid={collectionUuid as string}
          />
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
