"use client";

import { Menu } from "lucide-react";
import { LocaleSwitch } from "@/src/components/ui/ui/locale-switch";
import { ThemeSwitch } from "@/src/components/ui/ui/theme-switch";
import { useSidebar } from "@/src/components/ui/layout/SidebarContext";
import { TopicSelector } from "@/src/components/topic-selector";
import { TopbarSearch } from "./TopbarSearch";
import { Button } from "@/src/components/ui/ui/button";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/src/navigation";
import { useSearchParams } from "next/navigation";

export default function TopbarControls() {
  const { setSidebarOpen } = useSidebar();
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLocaleChange = (nextValue: string) => {
    const nextLocale = nextValue.toLowerCase();
    
    // next-intl's usePathname returns path without locale prefix
    // We just pass it directly. But we must also preserve search parameters.
    const searchString = searchParams.toString();
    const queryPath = searchString ? `${pathname}?${searchString}` : pathname;
    
    router.replace(
      // @ts-expect-error next-intl typed routing doesn't easily accept dynamic string query paths
      queryPath,
      { locale: nextLocale }
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
      <Button
        onClick={() => setSidebarOpen(true)}
        className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
        aria-label="Open sidebar menu" variant="ghost"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="min-w-0 flex-1">
        <TopbarSearch />
      </div>

      <div className="order-2 flex min-w-0 items-center gap-2 sm:gap-3">
        <TopicSelector />

        <ThemeSwitch className="shrink-0" />
        
        <LocaleSwitch
          value={currentLocale.toUpperCase()}
          onChange={handleLocaleChange}
          options={[
            { label: "EN", value: "EN" },
            { label: "KH", value: "KH" },
          ]}
          className="shrink-0"
        />
      </div>
    </div>
  );
}
