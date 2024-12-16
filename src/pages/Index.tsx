import { PersistentPermissionDialog } from "@/components/PersistentPermissionDialog";
import { WelcomeMenu } from "@/components/WelcomeMenu";

export default function Index() {
  return (
    <main className="size-full">
      <div className="flex size-full items-center justify-center">
        <WelcomeMenu />
      </div>

      <PersistentPermissionDialog />
    </main>
  );
}
