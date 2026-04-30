"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { ALL_TOPICS_VALUE } from "@/src/domains/content/utils/topic-utils";
import { LocaleSwitch } from "@/src/shared/components/ui/locale-switch";
import { useGlobalTopicFilter } from "@/src/shared/hooks/use-global-topic-filter";
import { useSidebar } from "../../context/sidebar-context";
import { TopbarSearch } from "./TopbarSearch";

export default function TopbarControls({
  topicOptions,
}: {
  topicOptions: Array<{ id: string; name: string }>;
}) {
  const { setSidebarOpen } = useSidebar();
  const { selectedTopic, setSelectedTopic } = useGlobalTopicFilter();
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
        <select
          value={selectedTopic}
          onChange={(event) => setSelectedTopic(event.target.value)}
          className="min-w-0 max-w-40 rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm sm:max-w-[12rem]"
          aria-label="Filter workspace by topic"
        >
          <option value={ALL_TOPICS_VALUE}>All Topics</option>
          {topicOptions.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.name}
            </option>
          ))}
        </select>

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
