"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTopicStore } from "@/src/stores/topic-store";
import { fetchTopics } from "@/src/actions/topic-actions";

export function TopicSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { activeTopic, topics, isLoading, setActiveTopic, setTopics, setLoading } = useTopicStore();

  useEffect(() => {
    let isMounted = true;

    async function loadTopics() {
      setLoading(true);
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
          setLoading(false);
        }
      }
    }

    // Only load topics if they are empty
    if (topics.length === 0) {
      loadTopics();
    } else {
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
  }, [searchParams, setActiveTopic, setLoading, setTopics, topics.length]); // Intentionally not including activeTopic to avoid loops

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
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

  if (isLoading) {
    return (
      <div className="flex w-40 sm:w-50 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium shadow-sm h-10 animate-pulse">
        <div className="h-4 w-20 bg-slate-200 rounded"></div>
      </div>
    );
  }

  return (
    <select
      value={activeTopic?.id ?? ""}
      onChange={handleChange}
      className="w-40 sm:w-50 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-ink shadow-sm transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-pm h-10"
      aria-label="Filter workspace by topic"
    >
      <option value="">All Topics</option>
      {topics.map((topic) => (
        <option key={topic.id} value={topic.id}>
          {topic.name}
        </option>
      ))}
    </select>
  );
}
