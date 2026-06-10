"use client";

import { useEffect, useMemo, useState } from "react";
import { ALL_TOPICS_VALUE } from "@/src/utils/topic-utils";
import {
  readManagedTopicsFromStorage,
  TOPICS_UPDATED_EVENT,
} from "@/src/utils/topic-storage";
import { useGlobalTopicFilter } from "@/src/hooks/use-global-topic-filter";
import { Select } from "@/src/components/ui/ui/select";

export function TopicSelect({
  topicOptions,
}: {
  topicOptions: Array<{ id: string; name: string }>;
}) {
  const { selectedTopic, setSelectedTopic } = useGlobalTopicFilter();
  const [managedTopicOptions, setManagedTopicOptions] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const syncTopics = () => {
      setManagedTopicOptions(
        readManagedTopicsFromStorage().map((topic) => ({
          id: topic.id,
          name: topic.name,
        })),
      );
    };

    syncTopics();
    window.addEventListener(TOPICS_UPDATED_EVENT, syncTopics);
    return () => window.removeEventListener(TOPICS_UPDATED_EVENT, syncTopics);
  }, []);

  const mergedTopicOptions = useMemo(() => {
    const options = new Map(topicOptions.map((topic) => [topic.id, topic]));

    managedTopicOptions.forEach((topic) => {
      options.set(topic.id, topic);
    });

    return Array.from(options.values()).sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  }, [managedTopicOptions, topicOptions]);

  return (
    <Select
      value={selectedTopic}
      onChange={(event) => setSelectedTopic(event.target.value)}
      className="min-w-0 max-w-40 rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pm sm:max-w-[12rem]"
      aria-label="Filter workspace by topic"
    >
      <option value={ALL_TOPICS_VALUE}>All Topics</option>
      {mergedTopicOptions.map((topic) => (
        <option key={topic.id} value={topic.id}>
          {topic.name}
        </option>
      ))}
    </Select>
  );
}
