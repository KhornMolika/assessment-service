"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { LocaleSwitch } from "@/src/shared/components/ui/locale-switch";
import { useSidebar } from "../../context/sidebar-context";
import { TopicSelect } from "./TopicSelect";
import { TopbarSearch } from "./TopbarSearch";

export default function TopbarControls({
  topicOptions,
}: {
  topicOptions: Array<{ id: string; name: string }>;
}) {
  const { setSidebarOpen } = useSidebar();
  const [locale, setLocale] = useState<"EN" | "KH">("EN");

  return (
    <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
      <button
        onClick={() => setSidebarOpen(true)}
        className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
        aria-label="Open sidebar menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <TopbarSearch />
      </div>

      <div className="order-2 flex min-w-0 items-center gap-2 sm:gap-3">
        <TopicSelect topicOptions={topicOptions} />

        <LocaleSwitch
          value={locale}
          onChange={(nextValue) => setLocale(nextValue as "EN" | "KH")}
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
