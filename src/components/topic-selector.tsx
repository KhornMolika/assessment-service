"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTopicStore } from "@/src/stores/topic-store";
import { fetchTopics } from "@/src/actions/topic-actions";
import { DropdownSelect } from "@/src/components/ui/ui/dropdown-select";

export function TopicSelector({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations("Topics");

  const { activeTopic, topics, setActiveTopic, setTopics } = useTopicStore();
  const [isFetching, setIsFetching] = useState(topics.length === 0);

  useEffect(() => {
    let isMounted = true;

    async function loadTopics() {
      setIsFetching(true);
      try {
        const fetchedTopics = await fetchTopics();
        if (isMounted) {
          setTopics(fetchedTopics);

          // Auto-select based on URL param if present
          const topicParam = searchParams.get("topic");
          if (topicParam) {
            const matchingTopic = fetchedTopics.find((t) => t.id === topicParam);
            if (matchingTopic) {
              setActiveTopic(matchingTopic);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch topics", error);
      } finally {
        if (isMounted) {
          setIsFetching(false);
        }
      }
    }

    // Only load topics if they are empty
    if (topics.length === 0) {
      loadTopics();
    } else {
      setIsFetching(false);
      // Sync URL if topics are already loaded
      const topicParam = searchParams.get("topic");
      if (topicParam) {
        const matchingTopic = topics.find((t) => t.id === topicParam);
        if (matchingTopic && activeTopic?.id !== matchingTopic.id) {
          setActiveTopic(matchingTopic);
        }
      }
    }

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, setActiveTopic, setTopics, topics.length]); // Intentionally not including activeTopic to avoid loops

  const handleChange = (selectedId: string) => {
    if (selectedId === "") {
      setActiveTopic(null);
      // Remove ?topic completely from URL
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("topic");
      const queryString = newParams.toString();
      router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
    } else {
      const selectedTopic = topics.find((t) => t.id === selectedId);
      if (selectedTopic) {
        setActiveTopic(selectedTopic);
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("topic", selectedId);
        router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
      }
    }
  };

  if (isFetching) {
    return (
      <div className={`flex w-40 sm:w-50 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium shadow-sm h-10 animate-pulse ${className || ""}`}>
        <div className="h-4 w-20 bg-slate-200 rounded"></div>
      </div>
    );
  }

  const topicOptions = [
    { value: "", label: t("allTopics") },
    ...topics
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((t) => ({ value: t.id, label: t.name })),
  ];

  return (
    <div className={`w-40 sm:w-50 ${className || ""}`}>
      <DropdownSelect
        value={activeTopic?.id ?? ""}
        options={topicOptions}
        onChange={handleChange}
        searchable
        searchPlaceholder="Search topics..."
        className="w-full"
      />
    </div>
  );
}
