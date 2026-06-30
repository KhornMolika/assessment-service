"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { LocaleSwitch } from "@/src/components/ui/ui/locale-switch";
import { useSidebar } from "@/src/components/ui/layout/SidebarContext";
import { TopicSelector } from "@/src/components/topic-selector";
import { TopbarSearch } from "./TopbarSearch";
import { Button } from "@/src/components/ui/ui/button";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export default function TopbarControls() {
  const { setSidebarOpen } = useSidebar();
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (nextValue: string) => {
    const nextLocale = nextValue.toLowerCase();
    const newPath = pathname.replace(/^\/(en|kh)/, `/${nextLocale}`);
    router.push(newPath);
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
