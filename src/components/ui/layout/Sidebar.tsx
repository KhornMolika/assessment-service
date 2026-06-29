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
  BarChart2,
  ArrowLeft,
  Settings,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
;
import {
  getHrefWithTopic,
  useSelectedTopic,
} from "@/src/hooks/use-global-topic-filter";
import { useSidebar } from "@/src/components/ui/layout/SidebarContext";
import SidebarNavLinks from "./SidebarNavLinks";
import { Button } from "@/src/components/ui/ui/button";

const workspaceNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Topics", href: "/topics", icon: Tags },
  { name: "Questions", href: "/questions", icon: HelpCircle },
  { name: "Question Banks", href: "/banks", icon: Library },
  { name: "Assessments", href: "/assessments", icon: ClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const assessmentMatch = pathname.match(/^\/assessments\/([0-9a-fA-F-]+)(?:\/|$)/);
  const resultMatch = pathname.match(/^\/results\/([0-9a-fA-F-]+)(?:\/|$)/);
  const isNewAssessment = pathname.endsWith('/new');
  const isAssessmentsList = pathname === '/assessments';
  const assessmentId = assessmentMatch && !isNewAssessment && !isAssessmentsList ? assessmentMatch[1] : null;
  const resultId = resultMatch ? resultMatch[1] : null;
  const requestedBackHref = searchParams.get("backHref");
  const resultBackHref = requestedBackHref?.startsWith("/")
    ? requestedBackHref
    : "/assessments";

  const assessmentNavigation = useMemo(() => {
    if (!assessmentId) return [];
    return [
      { name: "Overview", href: `/assessments/${assessmentId}`, icon: LayoutDashboard, hrefWithTopic: `/assessments/${assessmentId}`, exact: true },
      { name: "Setup", href: `/assessments/${assessmentId}/edit`, icon: Settings, hrefWithTopic: `/assessments/${assessmentId}/edit` },
      { name: "Results", href: `/assessments/${assessmentId}/reports`, icon: BarChart2, hrefWithTopic: `/assessments/${assessmentId}/reports` },
    ];
  }, [assessmentId]);
  const resultNavigation = useMemo(() => {
    if (!resultId) return [];
    return [
      {
        name: "Answer sheet",
        href: `/results/${resultId}`,
        icon: FileText,
        hrefWithTopic: `/results/${resultId}`,
        exact: true,
      },
    ];
  }, [resultId]);

  const handleNavigation = (nextPathname?: string) => {
    if (nextPathname) {
      setOptimisticPathname(nextPathname);
    }
    setSidebarOpen(false);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col bg-[#1B4332] text-white transition-[transform,width] duration-300 md:sticky md:top-0 md:z-50 md:translate-x-0
        ${collapsed ? "w-20" : "w-72"}
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <Button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-7 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-primary shadow-sm transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-pm md:flex"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} variant="secondary" size="icon"
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
          {assessmentId ? (
            <>
              {!collapsed && (
                <div className="mb-4 px-3">
                  <Link
                    href="/assessments"
                    onClick={() => handleNavigation("/assessments")}
                    className="flex items-center text-xs font-semibold text-white/70 transition hover:text-white"
                  >
                    <ArrowLeft className="mr-2 h-3 w-3" /> Back to Catalog
                  </Link>
                </div>
              )}
              {!collapsed && (
                <div className="mb-4 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                  Assessment
                </div>
              )}
              <nav className="flex flex-col space-y-1">
                <SidebarNavLinks
                  items={assessmentNavigation}
                  collapsed={collapsed}
                  activePathname={activePathname}
                  currentPathname={pathname}
                  optimisticPathname={optimisticPathname}
                  onIntent={(href) => router.prefetch(href)}
                  onNavigate={handleNavigation}
                />
              </nav>
            </>
          ) : resultId ? (
            <>
              {!collapsed && (
                <div className="mb-4 px-3">
                  <Link
                    href={resultBackHref}
                    onClick={() => handleNavigation(resultBackHref)}
                    className="flex items-center text-xs font-semibold text-white/70 transition hover:text-white"
                  >
                    <ArrowLeft className="mr-2 h-3 w-3" /> Back to Results
                  </Link>
                </div>
              )}
              {!collapsed && (
                <div className="mb-4 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                  Result detail
                </div>
              )}
              <nav className="flex flex-col space-y-1">
                <SidebarNavLinks
                  items={resultNavigation}
                  collapsed={collapsed}
                  activePathname={activePathname}
                  currentPathname={pathname}
                  optimisticPathname={optimisticPathname}
                  onIntent={(href) => router.prefetch(href)}
                  onNavigate={handleNavigation}
                />
              </nav>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
