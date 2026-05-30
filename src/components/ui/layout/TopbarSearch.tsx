"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ALL_TOPICS_VALUE } from "@/src/components/content/utils/topic-utils";

const GLOBAL_SEARCH_PATH = "/search";
const GLOBAL_SEARCH_PARAM = "search";

function buildHref(pathname: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function TopbarSearch() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const isSearchPage = pathname === GLOBAL_SEARCH_PATH;
  const urlValue = isSearchPage ? searchParams.get(GLOBAL_SEARCH_PARAM) ?? "" : "";
  const selectedTopic = searchParams.get("topic") ?? ALL_TOPICS_VALUE;
  const [inputValue, setInputValue] = useState(urlValue);

  useEffect(() => {
    setInputValue(urlValue);
  }, [urlValue]);

  const searchHref = useMemo(() => {
    const trimmedValue = inputValue.trim();
    const params = new URLSearchParams();

    if (selectedTopic !== ALL_TOPICS_VALUE) {
      params.set("topic", selectedTopic);
    }

    if (trimmedValue) {
      params.set(GLOBAL_SEARCH_PARAM, trimmedValue);
    }

    return buildHref(GLOBAL_SEARCH_PATH, params);
  }, [inputValue, selectedTopic]);

  useEffect(() => {
    if (!isSearchPage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchString);
      const trimmedValue = inputValue.trim();

      if (trimmedValue) {
        nextParams.set(GLOBAL_SEARCH_PARAM, trimmedValue);
      } else {
        nextParams.delete(GLOBAL_SEARCH_PARAM);
      }

      const nextHref = buildHref(GLOBAL_SEARCH_PATH, nextParams);
      const currentHref = buildHref(
        GLOBAL_SEARCH_PATH,
        new URLSearchParams(searchString),
      );

      if (nextHref !== currentHref) {
        router.replace(nextHref, { scroll: false });
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [inputValue, isSearchPage, router, searchString]);

  return (
    <form
      className="w-full max-w-xl"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        router.push(searchHref, { scroll: false });
      }}
    >
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-inkl" />
        <input
          type="search"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Search assessments, banks, and questions..."
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
          aria-label="Search assessments, banks, and questions"
        />
      </label>
    </form>
  );
}
