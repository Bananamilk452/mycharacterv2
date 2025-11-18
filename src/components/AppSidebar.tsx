import { Earth, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

import { CharacterDialog } from "@/components/CharacterDialog";
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
import { Character, Collection, CollectionInfo } from "@/lib/db";

interface Props {
  collection: Collection;
  collectionInfo: CollectionInfo;
  characters: Character[];
}

export function AppSidebar({ collection, collectionInfo, characters }: Props) {
  const [iconUrl, setIconUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (collectionInfo.icon) {
      const url = URL.createObjectURL(collectionInfo.icon);
      setIconUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [collectionInfo.icon]);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-gray-300">
            {iconUrl ? <img src={iconUrl} className="size-full" /> : <Earth />}
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
                <CharacterDialog collection={collection!}>
                  <SidebarMenuButton>
                    <UserPlus />
                    캐릭터 추가
                  </SidebarMenuButton>
                </CharacterDialog>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
