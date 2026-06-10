"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Library,
  Tags,
  TrendingUp,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
;
import {
  getHrefWithTopic,
  useSelectedTopic,
} from "@/src/hooks/use-global-topic-filter";
import { useSidebar } from "@/src/components/ui/layout/sidebar-context";
import SidebarNavLinks from "./SidebarNavLinks";
import { Button } from "@/src/components/ui/ui/button";

const workspaceNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Topics", href: "/topics", icon: Tags },
  { name: "Questions", href: "/questions", icon: HelpCircle },
  { name: "Question Banks", href: "/banks", icon: Library },
  { name: "Assessments", href: "/assessments", icon: ClipboardList },
];

const insightsNavigation = [
  { name: "Results", href: "/results", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [optimisticPathname, setOptimisticPathname] = useState<string | null>(null);
  const { sidebarOpen, setSidebarOpen, collapsed, setCollapsed } = useSidebar();
  const selectedTopic = useSelectedTopic();
  const activePathname =
    optimisticPathname != null && pathname !== optimisticPathname
      ? optimisticPathname
      : pathname;
  const workspaceLinks = useMemo(
    () =>
      workspaceNavigation.map((item) => ({
        ...item,
        hrefWithTopic: getHrefWithTopic(item.href, selectedTopic),
      })),
    [selectedTopic],
  );
  const insightLinks = useMemo(
    () =>
      insightsNavigation.map((item) => ({
        ...item,
        hrefWithTopic: getHrefWithTopic(item.href, selectedTopic),
      })),
    [selectedTopic],
  );

  const handleNavigation = (nextPathname?: string) => {
    if (nextPathname) {
      setOptimisticPathname(nextPathname);
    }
    setSidebarOpen(false);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col bg-[#1B4332] text-white transition-[transform,width] duration-300 md:sticky md:top-0 md:z-30 md:translate-x-0
        ${collapsed ? "w-20" : "w-72"}
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <Button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-7 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-primary shadow-sm transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-pm md:flex"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} variant="secondary"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </Button>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          {!collapsed ? (
            <div className="min-w-0">
              <Link
                href={getHrefWithTopic("/", selectedTopic)}
                className="flex items-center space-x-3"
                onClick={() => handleNavigation("/")}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white shadow-sm">
                  <Image
                    src={"/nbfsa-logo.png"}
                    alt="FSA logo"
                    width={44}
                    height={44}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-bold">AssessmentService</div>
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex w-full flex-col items-center gap-3">
              <Link
                href={getHrefWithTopic("/", selectedTopic)}
                className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white shadow-sm"
                onClick={() => handleNavigation("/")}
              >
                <Image
                  src={"/nbfsa-logo.png"}
                  alt="NBFSA logo"
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                  priority
                />
              </Link>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-6 px-2 py-4">
          {!collapsed && (
            <div className="mb-4 px-3 text-xs font-semibold text-white/40">WORKSPACE</div>
          )}
          <nav className="flex flex-col space-y-1">
            <SidebarNavLinks
              items={workspaceLinks}
              collapsed={collapsed}
              activePathname={activePathname}
              currentPathname={pathname}
              optimisticPathname={optimisticPathname}
              onIntent={(href) => router.prefetch(href)}
              onNavigate={handleNavigation}
            />
          </nav>

          {!collapsed && (
            <div className="mb-4 mt-8 px-3 text-xs font-semibold text-white/40">INSIGHTS</div>
          )}
          <nav className="flex flex-col space-y-1">
            <SidebarNavLinks
              items={insightLinks}
              collapsed={collapsed}
              activePathname={activePathname}
              currentPathname={pathname}
              optimisticPathname={optimisticPathname}
              onIntent={(href) => router.prefetch(href)}
              onNavigate={handleNavigation}
            />
          </nav>
        </div>
      </div>
    </aside>
  );
}
