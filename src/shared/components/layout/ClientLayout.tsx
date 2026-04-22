"use client";

import { usePathname } from "next/navigation";
import Overlay from "./Overlay";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullscreenAssessmentRoute =
    /^\/assessments\/[^/]+\/(take|host|join|self-paced-preview|real-time-preview)$/.test(
      pathname,
    );

  if (isFullscreenAssessmentRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <Overlay />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
