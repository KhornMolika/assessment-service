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
import { useTranslations } from "next-intl";

const workspaceNavigation = [
  { tKey: "dashboard", href: "/", icon: LayoutDashboard },
  { tKey: "topics", href: "/topics", icon: Tags },
  { tKey: "questions", href: "/questions", icon: HelpCircle },
  { tKey: "banks", href: "/banks", icon: Library },
  { tKey: "assessments", href: "/assessments", icon: ClipboardList },
];

export default function Sidebar() {
  const t = useTranslations("Sidebar");
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

  // Strip locale prefix (e.g. /en, /th) so active checks match item hrefs correctly
  const strippedActivePathname = activePathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  const workspaceLinks = useMemo(
    () =>
      workspaceNavigation.map((item) => ({
        ...item,
        name: t(item.tKey),
        hrefWithTopic: getHrefWithTopic(item.href, selectedTopic),
      })),
    [selectedTopic, t],
  );
  const assessmentMatch = pathname.match(/\/assessments\/([0-9a-fA-F-]+)(?:\/|$)/);
  const resultMatch = pathname.match(/\/results\/([0-9a-fA-F-]+)(?:\/|$)/);
  const questionMatch = pathname.match(/\/questions\/([0-9a-fA-F-]+)(?:\/|$)/);
  const bankMatch = pathname.match(/\/banks\/([0-9a-fA-F-]+)(?:\/|$)/);
  const isNewPath = pathname.endsWith('/new');
  const isAssessmentsList = pathname.endsWith('/assessments');
  const isQuestionsList = pathname.endsWith('/questions');
  const isBanksList = pathname.endsWith('/banks');
  const assessmentId = assessmentMatch && !isNewPath && !isAssessmentsList ? assessmentMatch[1] : null;
  const resultId = resultMatch ? resultMatch[1] : null;
  const questionId = questionMatch && !isNewPath && !isQuestionsList ? questionMatch[1] : null;
  const bankId = bankMatch && !isNewPath && !isBanksList ? bankMatch[1] : null;
  const requestedBackHref = searchParams.get("backHref");
  const resultBackHref = requestedBackHref?.startsWith("/")
    ? requestedBackHref
    : "/assessments";

  const assessmentNavigation = useMemo(() => {
    if (!assessmentId) return [];
    return [
      { name: t("overview"), href: `/assessments/${assessmentId}`, icon: LayoutDashboard, hrefWithTopic: `/assessments/${assessmentId}`, exact: true },
      { name: t("setup"), href: `/assessments/${assessmentId}/edit`, icon: Settings, hrefWithTopic: `/assessments/${assessmentId}/edit` },
      { name: t("results"), href: `/assessments/${assessmentId}/reports`, icon: BarChart2, hrefWithTopic: `/assessments/${assessmentId}/reports` },
    ];
  }, [assessmentId, t]);
  const resultNavigation = useMemo(() => {
    if (!resultId) return [];
    return [
      {
        name: t("answerSheet"),
        href: `/results/${resultId}`,
        icon: FileText,
        hrefWithTopic: `/results/${resultId}`,
        exact: true,
      },
    ];
  }, [resultId, t]);

  const questionNavigation = useMemo(() => {
    if (!questionId) return [];
    return [
      { name: t("overview"), href: `/questions/${questionId}`, icon: LayoutDashboard, hrefWithTopic: `/questions/${questionId}`, exact: true },
      { name: t("setup"), href: `/questions/${questionId}/edit`, icon: Settings, hrefWithTopic: `/questions/${questionId}/edit` },
    ];
  }, [questionId, t]);

  const bankNavigation = useMemo(() => {
    if (!bankId) return [];
    return [
      { name: t("overview"), href: `/banks/${bankId}`, icon: LayoutDashboard, hrefWithTopic: `/banks/${bankId}`, exact: true },
      { name: t("setup"), href: `/banks/${bankId}/edit`, icon: Settings, hrefWithTopic: `/banks/${bankId}/edit` },
    ];
  }, [bankId, t]);

  const handleNavigation = (nextPathname?: string) => {
    if (nextPathname) {
      setOptimisticPathname(nextPathname);
    }
    setSidebarOpen(false);
  };

  return (
    <aside
      className={`workspace-sidebar fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col bg-[#1B4332] text-white transition-[transform,width] duration-300 md:sticky md:top-0 md:z-50 md:translate-x-0
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
          {!assessmentId && !resultId && !questionId && !bankId && (
            <div className="space-y-1">
              {!collapsed && (
                <div className="mb-4 px-3 text-xs font-semibold uppercase text-white/40">{t("workspaceCategory")}</div>
              )}
              <nav className="flex flex-col space-y-1">
                <SidebarNavLinks
                  items={workspaceLinks}
                  collapsed={collapsed}
                  activePathname={strippedActivePathname}
                  currentPathname={pathname}
                  optimisticPathname={optimisticPathname}
                  onIntent={(href) => router.prefetch(href)}
                  onNavigate={handleNavigation}
                />
              </nav>
            </div>
          )}
          {assessmentId && (
            <div className="space-y-1">
              {!collapsed && (
                <div className="mb-4 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                  {t("assessmentCategory")}
                </div>
              )}
              <nav className="flex flex-col space-y-1">
                <SidebarNavLinks
                  items={assessmentNavigation}
                  collapsed={collapsed}
                  activePathname={strippedActivePathname}
                  currentPathname={pathname}
                  optimisticPathname={optimisticPathname}
                  onIntent={(href) => router.prefetch(href)}
                  onNavigate={handleNavigation}
                />
              </nav>
            </div>
          )}
          
          {resultId && (
            <div className="space-y-1">
              {!collapsed && (
                <div className="mb-4 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                  {t("resultCategory")}
                </div>
              )}
              <nav className="flex flex-col space-y-1">
                <SidebarNavLinks
                  items={resultNavigation}
                  collapsed={collapsed}
                  activePathname={strippedActivePathname}
                  currentPathname={pathname}
                  optimisticPathname={optimisticPathname}
                  onIntent={(href) => router.prefetch(href)}
                  onNavigate={handleNavigation}
                />
              </nav>
            </div>
          )}

          {questionId && (
            <div className="space-y-1">
              {!collapsed && (
                <div className="mb-4 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                  {t("questions")}
                </div>
              )}
              <nav className="flex flex-col space-y-1">
                <SidebarNavLinks
                  items={questionNavigation}
                  collapsed={collapsed}
                  activePathname={strippedActivePathname}
                  currentPathname={pathname}
                  optimisticPathname={optimisticPathname}
                  onIntent={(href) => router.prefetch(href)}
                  onNavigate={handleNavigation}
                />
              </nav>
            </div>
          )}

          {bankId && (
            <div className="space-y-1">
              {!collapsed && (
                <div className="mb-4 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                  {t("banks")}
                </div>
              )}
              <nav className="flex flex-col space-y-1">
                <SidebarNavLinks
                  items={bankNavigation}
                  collapsed={collapsed}
                  activePathname={strippedActivePathname}
                  currentPathname={pathname}
                  optimisticPathname={optimisticPathname}
                  onIntent={(href) => router.prefetch(href)}
                  onNavigate={handleNavigation}
                />
              </nav>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
