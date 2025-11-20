import { useEffect } from "react";

import { PersistentPermissionDialog } from "@/components/home/PersistentPermissionDialog";
import { WelcomeMenu } from "@/components/home/WelcomeMenu";

export default function Index() {
  useEffect(() => {
    document.title = "마이자캐v2";
  }, []);

  return (
    <main className="h-dvh w-dvw">
      <div className="flex size-full items-center justify-center">
        <WelcomeMenu />
      </div>

      <PersistentPermissionDialog />
    </main>
  );
}
