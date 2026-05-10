"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function buildHref(pathname: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export function useUrlQueryUpdater() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  return useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value == null || value === "") {
          nextParams.delete(key);
          return;
        }

        nextParams.set(key, String(value));
      });

      const nextHref = buildHref(pathname, nextParams);
      const currentHref = buildHref(pathname, new URLSearchParams(searchParams.toString()));

      if (nextHref === currentHref) {
        return;
      }

      router.replace(nextHref, { scroll: false });
    },
    [pathname, router, searchParams],
  );
}

export function useDebouncedSearchParam({
  key = "query",
  delay = 300,
}: {
  key?: string;
  delay?: number;
}) {
  const searchParams = useSearchParams();
  const updateUrl = useUrlQueryUpdater();
  const searchValueFromUrl = searchParams.get(key) ?? "";
  const [inputValue, setInputValue] = useState(searchValueFromUrl);

  useEffect(() => {
    setInputValue(searchValueFromUrl);
  }, [searchValueFromUrl]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      updateUrl({
        [key]: inputValue.trim() ? inputValue.trim() : null,
        page: null,
      });
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [delay, inputValue, key, updateUrl]);

  return {
    inputValue,
    setInputValue,
    searchValueFromUrl,
  };
}
