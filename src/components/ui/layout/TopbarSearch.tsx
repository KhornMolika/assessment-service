"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ALL_TOPICS_VALUE } from "@/src/utils/topic-utils";
import { Label } from "@/src/components/ui/ui/label";
import { Input } from "@/src/components/ui/ui/input";
import { useTranslations } from "next-intl";

const GLOBAL_SEARCH_PATH = "/search";
const GLOBAL_SEARCH_PARAM = "search";

function buildHref(pathname: string, searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function TopbarSearch() {
  const t = useTranslations("Topbar");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const isSearchPage = pathname === GLOBAL_SEARCH_PATH;
  const urlValue = isSearchPage ? searchParams.get(GLOBAL_SEARCH_PARAM) ?? "" : "";
  const selectedTopic = searchParams.get("topic") ?? ALL_TOPICS_VALUE;
  const [inputValue, setInputValue] = useState(urlValue);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    const timeoutId = window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchString);
      const trimmedValue = inputValue.trim();

      if (trimmedValue) {
        nextParams.set(GLOBAL_SEARCH_PARAM, trimmedValue);
      } else {
        nextParams.delete(GLOBAL_SEARCH_PARAM);
        // If it's completely empty and we aren't on the search page, don't auto-navigate
        if (!isSearchPage) return;
      }

      const nextHref = buildHref(GLOBAL_SEARCH_PATH, nextParams);
      const currentHref = buildHref(
        isSearchPage ? GLOBAL_SEARCH_PATH : pathname,
        new URLSearchParams(searchString),
      );

      if (nextHref !== currentHref) {
        if (!isSearchPage) {
          router.push(nextHref, { scroll: false });
        } else {
          router.replace(nextHref, { scroll: false });
        }
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [inputValue, isSearchPage, pathname, router, searchString]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full max-w-xl items-center gap-2 rounded-xl border border-border bg-card py-2.5 pl-4 pr-3 text-sm text-inkd transition hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-pm"
        aria-label={t("searchPlaceholder")}
      >
        <Search className="h-4 w-4 text-inkl" />
        <span className="flex-1 text-left">{t("searchPlaceholder")}</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-inkd sm:inline-block">
          ⌘K
        </kbd>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 pt-[10vh] backdrop-blur-sm px-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-border"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                setIsOpen(false);
                router.push(searchHref, { scroll: false });
              }}
              className="flex items-center gap-3 border-b border-border p-4"
            >
              <Search className="h-5 w-5 text-pm" />
              <input
                autoFocus
                type="search"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder={t("searchPlaceholder")}
                className="flex-1 bg-transparent text-lg text-primary placeholder:text-inkl focus:outline-none"
              />
              <kbd className="hidden rounded bg-muted px-2 py-1 text-xs font-medium text-inkd sm:inline-block">
                ESC
              </kbd>
            </form>
            
            {/* Soft hint underneath the search bar */}
            <div className="bg-muted/30 px-4 py-3 text-xs text-inkd">
              {t("searchHint")}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
