import { PersistentPermissionDialog } from "@/components/home/PersistentPermissionDialog";
import { WelcomeMenu } from "@/components/home/WelcomeMenu";
import { useEffect } from "react";

export default function Index() {
  useEffect(() => {
    document.title = "마이자캐v2";
  }, []);

  return (
    <main className="size-full">
      <div className="flex size-full items-center justify-center">
        <WelcomeMenu />
      </div>

      <PersistentPermissionDialog />
    </main>
  );
}
