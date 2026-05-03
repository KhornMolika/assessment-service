"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { WorkspacePageSkeleton } from "./PageSkeletons";

export const WORKSPACE_NAVIGATION_START_EVENT = "workspace:navigation-start";

export function announceWorkspaceNavigation(pathname: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(WORKSPACE_NAVIGATION_START_EVENT, {
      detail: { pathname },
    }),
  );
}

export default function MainContentFrame() {
  const pathname = usePathname();
  const [pendingPathname, setPendingPathname] = useState<string | null>(null);
  const isPending =
    pendingPathname != null && pendingPathname !== pathname;

  useEffect(() => {
    const handleNavigationStart = (event: Event) => {
      const nextPathname = (event as CustomEvent<{ pathname?: string }>).detail
        ?.pathname;

      if (nextPathname && nextPathname !== pathname) {
        setPendingPathname(nextPathname);
      }
    };

    window.addEventListener(WORKSPACE_NAVIGATION_START_EVENT, handleNavigationStart);

    return () => {
      window.removeEventListener(
        WORKSPACE_NAVIGATION_START_EVENT,
        handleNavigationStart,
      );
    };
  }, [pathname]);

  useEffect(() => {
    if (!isPending) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPendingPathname(null);
    }, 8000);

    return () => window.clearTimeout(timeoutId);
  }, [isPending]);

  if (!isPending) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-10 overflow-auto bg-background">
      <WorkspacePageSkeleton />
    </div>
  );
}
