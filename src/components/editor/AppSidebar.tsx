import { CogIcon, Earth, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";

import { CharacterModal } from "@/components/editor/CharacterModal";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useCollection } from "@/hooks/useCollection";

import { Spinner } from "../Spinner";
import { UpdateCollectionModal } from "./UpdateCollectionModal";

interface AppSidebarProps {
  uuid: string;
}

export function AppSidebar({ uuid }: AppSidebarProps) {
  const { collectionInfo, characters } = useCollection(uuid);
  const [isCharacterDialogOpen, setIsCharacterDialogOpen] = useState(false);
  const [isUpdateCollectionDialogOpen, setIsUpdateCollectionDialogOpen] =
    useState(false);

  const iconUrl = useMemo(() => {
    if (collectionInfo && collectionInfo.icon) {
      return URL.createObjectURL(collectionInfo.icon);
    }
    return undefined;
  }, [collectionInfo]);
  return (
    <Sidebar>
      {collectionInfo && characters ? (
        <>
          <SidebarHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-gray-300">
                {iconUrl ? (
                  <img src={iconUrl} className="size-full" />
                ) : (
                  <Earth />
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <h1 className="truncate text-sm font-semibold">
                  {collectionInfo.name}
                </h1>
                <p className="text-xs text-gray-500">
                  캐릭터 {characters.length}명
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>콜렉션</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setIsCharacterDialogOpen(true)}
                    >
                      <UserPlus />
                      캐릭터 추가
                    </SidebarMenuButton>
                    <CharacterModal
                      collectionUuid={uuid}
                      open={isCharacterDialogOpen}
                      setOpen={setIsCharacterDialogOpen}
                    />
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setIsUpdateCollectionDialogOpen(true)}
                    >
                      <CogIcon />
                      콜렉션 설정
                    </SidebarMenuButton>
                    <UpdateCollectionModal
                      collectionUuid={uuid}
                      open={isUpdateCollectionDialogOpen}
                      setOpen={setIsUpdateCollectionDialogOpen}
                    />
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </>
      ) : (
        <Spinner />
      )}
    </Sidebar>
  );
}
