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
  TrendingUp,
} from "lucide-react";
import nbfsaLogo from "@/src/shared/assets/nbfsa-logo.png";
import { useGlobalTopicFilter } from "@/src/shared/hooks/use-global-topic-filter";
import { useSidebar } from "../../context/sidebar-context";
import SidebarNavLinks from "./SidebarNavLinks";

const workspaceNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Question Banks", href: "/banks", icon: Library },
  { name: "Questions", href: "/questions", icon: HelpCircle },
  { name: "Assessments", href: "/assessments", icon: ClipboardList },
];

const insightsNavigation = [
  { name: "Results", href: "/results", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
];

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, collapsed, setCollapsed } = useSidebar();
  const { getHrefWithSelectedTopic } = useGlobalTopicFilter();

  const handleNavigation = () => {
    setSidebarOpen(false);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col bg-[#1B4332] text-white transition-[transform,width] duration-300 md:sticky md:top-0 md:z-30 md:translate-x-0
        ${collapsed ? "w-20" : "w-72"}
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          {!collapsed ? (
            <>
              <Link
                href={getHrefWithSelectedTopic("/")}
                className="flex items-center space-x-3"
                onClick={handleNavigation}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white shadow-sm">
                  <Image
                    src={nbfsaLogo}
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
              <button
                onClick={() => setCollapsed(true)}
                className="ml-0.5 flex shrink-0 items-center justify-center rounded-lg p-2 text-white/60 transition hover:bg-white/5 hover:text-white"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="flex w-full flex-col items-center gap-3">
              <Link
                href={getHrefWithSelectedTopic("/")}
                className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white shadow-sm"
                onClick={handleNavigation}
              >
                <Image
                  src={nbfsaLogo}
                  alt="NBFSA logo"
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                  priority
                />
              </Link>
              <button
                onClick={() => setCollapsed(false)}
                className="flex items-center justify-center rounded-lg p-2 text-white/60 transition hover:bg-white/5 hover:text-white"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-6 px-2 py-4">
          {!collapsed && (
            <div className="mb-4 px-3 text-xs font-semibold text-white/40">WORKSPACE</div>
          )}
          <nav className="flex flex-col space-y-1">
            <SidebarNavLinks
              items={workspaceNavigation}
              collapsed={collapsed}
              onNavigate={handleNavigation}
            />
          </nav>

          {!collapsed && (
            <div className="mb-4 mt-8 px-3 text-xs font-semibold text-white/40">INSIGHTS</div>
          )}
          <nav className="flex flex-col space-y-1">
            <SidebarNavLinks
              items={insightsNavigation}
              collapsed={collapsed}
              onNavigate={handleNavigation}
            />
          </nav>
        </div>
      </div>
    </aside>
  );
}
