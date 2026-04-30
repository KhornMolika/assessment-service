"use client";

import { useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ALL_TOPICS_VALUE } from "@/src/domains/content/utils/topic-utils";

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

export function useGlobalTopicFilter() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTopic = searchParams.get(TOPIC_QUERY_PARAM) ?? ALL_TOPICS_VALUE;

  useEffect(() => {
    const topicFromUrl = searchParams.get(TOPIC_QUERY_PARAM);

    if (topicFromUrl) {
      writeStoredTopic(topicFromUrl);
    }
  }, [searchParams]);

  const setSelectedTopic = useCallback(
    (nextTopic: string) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      if (nextTopic === ALL_TOPICS_VALUE) {
        nextParams.delete(TOPIC_QUERY_PARAM);
      } else {
        nextParams.set(TOPIC_QUERY_PARAM, nextTopic);
      }

      nextParams.delete("page");
      writeStoredTopic(nextTopic);
      router.replace(buildHref(pathname, nextParams), { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const getHrefWithSelectedTopic = useCallback(
    (href: string) => {
      if (selectedTopic === ALL_TOPICS_VALUE) {
        return href;
      }

      const [targetPathname, targetQuery = ""] = href.split("?");
      const nextParams = new URLSearchParams(targetQuery);
      nextParams.set(TOPIC_QUERY_PARAM, selectedTopic);
      return buildHref(targetPathname, nextParams);
    },
    [selectedTopic],
  );

  return useMemo(
    () => ({
      selectedTopic,
      setSelectedTopic,
      getHrefWithSelectedTopic,
    }),
    [getHrefWithSelectedTopic, selectedTopic, setSelectedTopic],
  );
}
