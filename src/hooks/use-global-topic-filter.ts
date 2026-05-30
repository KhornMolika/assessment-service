"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ALL_TOPICS_VALUE } from "@/src/components/content/utils/topic-utils";

const TOPIC_QUERY_PARAM = "topic";
const TOPIC_STORAGE_KEY = "assessment-service:selected-topic";

function buildHref(pathname: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function writeStoredTopic(topicId: string) {
  if (typeof window === "undefined") {
    return;
  }

  if (topicId === ALL_TOPICS_VALUE) {
    window.localStorage.removeItem(TOPIC_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(TOPIC_STORAGE_KEY, topicId);
}

function scheduleStoredTopicWrite(topicId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const write = () => writeStoredTopic(topicId);

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(write, { timeout: 500 });
    return;
  }

  globalThis.setTimeout(write, 0);
}

export function getHrefWithTopic(href: string, selectedTopic: string) {
  if (selectedTopic === ALL_TOPICS_VALUE) {
    return href;
  }

  const [targetPathname, targetQuery = ""] = href.split("?");
  const nextParams = new URLSearchParams(targetQuery);
  nextParams.set(TOPIC_QUERY_PARAM, selectedTopic);
  return buildHref(targetPathname, nextParams);
}

export function useSelectedTopic() {
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();

  return useMemo(() => {
    const params = new URLSearchParams(searchString);
    return params.get(TOPIC_QUERY_PARAM) ?? ALL_TOPICS_VALUE;
  }, [searchString]);
}

export function useGlobalTopicFilter() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const urlSelectedTopic = useMemo(() => {
    const params = new URLSearchParams(searchString);
    return params.get(TOPIC_QUERY_PARAM) ?? ALL_TOPICS_VALUE;
  }, [searchString]);
  const [selectedTopic, setOptimisticSelectedTopic] = useState(urlSelectedTopic);

  useEffect(() => {
    setOptimisticSelectedTopic(urlSelectedTopic);
  }, [urlSelectedTopic]);

  const setSelectedTopic = useCallback(
    (nextTopic: string) => {
      if (nextTopic === selectedTopic) {
        return;
      }

      setOptimisticSelectedTopic(nextTopic);

      const nextParams = new URLSearchParams(searchString);

      if (nextTopic === ALL_TOPICS_VALUE) {
        nextParams.delete(TOPIC_QUERY_PARAM);
      } else {
        nextParams.set(TOPIC_QUERY_PARAM, nextTopic);
      }

      nextParams.delete("page");
      scheduleStoredTopicWrite(nextTopic);
      const nextHref = buildHref(pathname, nextParams);
      const currentHref = searchString ? `${pathname}?${searchString}` : pathname;

      if (nextHref !== currentHref) {
        router.replace(nextHref, { scroll: false });
      }
    },
    [pathname, router, searchString, selectedTopic],
  );

  return {
    selectedTopic,
    setSelectedTopic,
  };
}
