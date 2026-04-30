import { Suspense } from "react";
import { TopbarSkeleton } from "@/src/shared/components/layout/PageSkeletons";
import { SidebarProvider } from "@/src/shared/context/sidebar-context";
import Overlay from "./Overlay";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarProvider>
        <Suspense fallback={null}>
          <Sidebar />
        </Suspense>
        <Overlay />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Suspense fallback={<TopbarSkeleton />}>
            <Topbar />
          </Suspense>
          <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
        </div>
      </SidebarProvider>
    </div>
  );
}
