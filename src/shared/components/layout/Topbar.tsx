"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Menu } from "lucide-react";
import {
  getMockBankTopics,
  getMockQuestionTopics,
  getMockTopics,
} from "@/src/domains/content/api/content.api";
import { getMockAssessmentTopics } from "@/src/domains/assessment/api/assessment.api";
import { ALL_TOPICS_VALUE, getTopicOptions } from "@/src/domains/content/utils/topic-utils";
import { LocaleSwitch } from "@/src/shared/components/ui/locale-switch";
import { useSidebar } from "../../context/sidebar-context";

export default function Topbar() {
  const { setSidebarOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [locale, setLocale] = useState<"EN" | "KH">("EN");
  const [topicOptions, setTopicOptions] = useState<Array<{ id: string; name: string }>>([]);
  const supportsTopicFilter =
    pathname === "/questions" ||
    pathname === "/banks" ||
    pathname === "/assessments" ||
    pathname === "/results" ||
    pathname === "/analytics";
  const selectedTopic = searchParams.get("topic") ?? ALL_TOPICS_VALUE;

  useEffect(() => {
    if (!supportsTopicFilter) {
      return;
    }

    let isActive = true;

    async function loadTopicOptions() {
      const [topics, bankTopics, questionTopics, assessmentTopics] = await Promise.all([
        getMockTopics(),
        getMockBankTopics(),
        getMockQuestionTopics(),
        getMockAssessmentTopics(),
      ]);

      if (isActive) {
        setTopicOptions(
          getTopicOptions({ topics, bankTopics, questionTopics, assessmentTopics }).map(
            (topic) => ({
              id: topic.id,
              name: topic.name,
            }),
          ),
        );
      }
    }

    void loadTopicOptions();

    return () => {
      isActive = false;
    };
  }, [supportsTopicFilter]);

  const handleTopicChange = (nextTopic: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextTopic === ALL_TOPICS_VALUE) {
      params.delete("topic");
    } else {
      params.set("topic", nextTopic);
    }

    router.push(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
  };

  return (
    <header className="sticky top-0 z-20 w-full border-b border-bdr bg-card px-4 py-3 shadow-sm sm:px-6">
      <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="order-2 w-full flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3 lg:order-2 lg:flex-none">
          {supportsTopicFilter && (
            <select
              value={selectedTopic}
              onChange={(event) => handleTopicChange(event.target.value)}
              className="min-w-0 max-w-40 rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm sm:max-w-[12rem]"
              aria-label="Filter questions by topic"
            >
              <option value={ALL_TOPICS_VALUE}>All Topics</option>
              {topicOptions.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          )}

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
    </header>
  );
}
