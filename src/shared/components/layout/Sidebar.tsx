"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
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
import { useSidebar } from "../../context/sidebar-context";

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, collapsed, setCollapsed } = useSidebar();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

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

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

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
              <Link href="/" className="flex items-center space-x-3" onClick={handleNavigation}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--acc)/20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#74C69D" />
                    <path
                      d="M2 17L12 22L22 17V12L12 17L2 12V17Z"
                      fill="#74C69D"
                      opacity="0.6"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-bold">AssessmentService</div>
                  <div className="text-xs text-white/60">Creator Studio</div>
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
                href="/"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--acc)/20"
                onClick={handleNavigation}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#74C69D" />
                  <path
                    d="M2 17L12 22L22 17V12L12 17L2 12V17Z"
                    fill="#74C69D"
                    opacity="0.6"
                  />
                </svg>
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
            {workspaceNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavigation}
                className={`flex items-center rounded py-3 font-medium transition ${
                  collapsed ? "justify-center px-0" : "px-3"
                } ${
                  isActive(item.href)
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5"
                }`}
                title={collapsed ? item.name : undefined}
              >
                <item.icon size={20} />
                {!collapsed && <span className="ml-2">{item.name}</span>}
              </Link>
            ))}
          </nav>

          {!collapsed && (
            <div className="mb-4 mt-8 px-3 text-xs font-semibold text-white/40">INSIGHTS</div>
          )}
          <nav className="flex flex-col space-y-1">
            {insightsNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavigation}
                className={`flex items-center rounded py-3 font-medium transition ${
                  collapsed ? "justify-center px-0" : "px-3"
                } ${
                  isActive(item.href)
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5"
                }`}
                title={collapsed ? item.name : undefined}
              >
                <item.icon size={20} />
                {!collapsed && <span className="ml-2">{item.name}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-3 border-t border-white/10 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--acc) font-bold text-[#1B4332]">
            KM
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Khorn Molika</p>
              <p className="truncate text-xs text-white/60">molika@eduhub.kh</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
