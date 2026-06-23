"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_TOPICS_VALUE } from "@/src/utils/topic-utils";
import { useGlobalTopicFilter } from "@/src/hooks/use-global-topic-filter";
import { ChevronDown, Tag } from "lucide-react";

export function TopicSelect({
  topicOptions,
}: {
  topicOptions: Array<{ id: string; name: string }>;
}) {
  const { selectedTopic, setSelectedTopic } = useGlobalTopicFilter();
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const sortedTopics = useMemo(() => {
    return [...topicOptions].sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  }, [topicOptions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    setSelectedTopic(id);
    setIsOpen(false);
  };

  const selectedName = selectedTopic === ALL_TOPICS_VALUE 
    ? "All Topics" 
    : sortedTopics.find(t => t.id === selectedTopic)?.name || "All Topics";

  return (
    <div className="relative" ref={selectRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-40 sm:w-50 items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-ink shadow-sm transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-pm"
        aria-label="Filter workspace by topic"
      >
        <span className="flex items-center gap-2 truncate">
          <Tag className="h-4 w-4 shrink-0 text-inkd" />
          <span className="truncate">{selectedName}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-inkd transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 flex max-h-80 min-w-60 w-max max-w-100 origin-top-right flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="flex-1 overflow-y-auto min-h-0 py-1.5">
            <button
              onClick={() => handleSelect(ALL_TOPICS_VALUE)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 hover:text-slate-900 ${
                selectedTopic === ALL_TOPICS_VALUE
                  ? "bg-primary/5 font-semibold text-primary"
                  : "font-medium text-slate-700"
              }`}
            >
              All Topics
            </button>
            {sortedTopics.length > 0 && <div className="my-1.5 h-px bg-slate-100" />}
            {sortedTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleSelect(topic.id)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 hover:text-slate-900 ${
                  selectedTopic === topic.id
                    ? "bg-primary/5 font-semibold text-primary"
                    : "text-slate-600"
                }`}
              >
                {topic.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
