import { Suspense } from "react";
import {
  TopbarSkeleton,
  WorkspacePageSkeleton,
} from "@/src/components/ui/layout/PageSkeletons";
import { SidebarProvider } from "@/src/components/ui/layout/SidebarContext";
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
          <main className="relative flex-1 overflow-auto p-6">
            <Suspense fallback={<WorkspacePageSkeleton />}>
              {children}
            </Suspense>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
