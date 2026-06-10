"use client";

import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Select } from "@/src/components/ui/ui/select";
import { Button } from "@/src/components/ui/ui/button";

function getVisiblePages(currentPage: number, totalPages: number) {
  const maxButtons = 5;

  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }

  if (currentPage >= totalPages - 2) {
    return Array.from({ length: maxButtons }, (_, index) => totalPages - 4 + index);
  }

  return Array.from({ length: maxButtons }, (_, index) => currentPage - 2 + index);
}

function buildHref({
  pathname,
  searchParams,
  updates,
  defaultPageSize,
}: {
  pathname: string;
  searchParams: Record<string, string | null | undefined>;
  updates: Record<string, string | number | null | undefined>;
  defaultPageSize: number;
}) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  Object.entries(updates).forEach(([key, value]) => {
    const isDefaultPage = key === "page" && value === 1;
    const isDefaultPageSize = key === "pageSize" && value === defaultPageSize;

    if (value == null || value === "" || isDefaultPage || isDefaultPageSize) {
      params.delete(key);
      return;
    }

    params.set(key, String(value));
  });

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export default function LinkPagination({
  pathname,
  searchParams,
  currentPage,
  totalPages,
  pageSize,
  defaultPageSize = 10,
  totalItems,
  pageSizeOptions = [5, 10, 20, 50],
  itemLabel,
}: {
  pathname: string;
  searchParams: Record<string, string | null | undefined>;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  defaultPageSize?: number;
  totalItems: number;
  pageSizeOptions?: number[];
  itemLabel: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const visiblePages = getVisiblePages(currentPage, totalPages);
  const isSinglePage = totalPages <= 1;
  const mobileVisiblePages =
    totalPages <= 3
      ? Array.from({ length: totalPages }, (_, index) => index + 1)
      : Array.from(
          new Set([
            Math.max(1, currentPage - 1),
            currentPage,
            Math.min(totalPages, currentPage + 1),
          ]),
        );
  const navigate = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      const href = buildHref({ pathname, searchParams, updates, defaultPageSize });
      startTransition(() => {
        router.push(href, { scroll: false });
      });
    },
    [defaultPageSize, pathname, router, searchParams, startTransition],
  );

  return (
    <div className="flex flex-col gap-4 border-t border-border px-4 py-4 sm:px-6">
      <div className="flex gap-3 flex-row items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm text-inkd">
          <span>Show</span>
          <Select
            value={pageSize}
            onChange={(event) => navigate({ pageSize: Number(event.target.value), page: null })}
            className="rounded-lg border border-border bg-card px-3 py-1 focus:outline-none focus:ring-2 focus:ring-pm"
          >
            {pageSizeOptions.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            ))}
          </Select>
          <span>
            of {totalItems} {itemLabel}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm text-inkd lg:justify-end">
          <span>
            Page {Math.min(currentPage, Math.max(totalPages, 1))} of {Math.max(totalPages, 1)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <Button
            onClick={() => navigate({ page: null })}
            disabled={currentPage === 1 || isSinglePage}
            className="hidden h-9 w-9 items-center justify-center rounded-xl border border-border transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
            aria-label="First page" variant="secondary"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => navigate({ page: Math.max(1, currentPage - 1) })}
            disabled={currentPage === 1 || isSinglePage}
            className="flex h-9 min-w-9 items-center justify-center rounded-xl border border-border px-3 transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:min-w-10 sm:px-0"
            aria-label="Previous page" variant="secondary"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 sm:hidden">
            {mobileVisiblePages.map((pageNumber) => (
              <Button
                key={`mobile-${pageNumber}`}
                onClick={() => navigate({ page: pageNumber })}
                className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
                  currentPage === pageNumber
                    ? "bg-primary text-white"
                    : "border border-border hover:bg-muted"
                }`}
              >
                {pageNumber}
              </Button>
            ))}
          </div>

          <div className="hidden flex-wrap items-center gap-2 sm:flex">
            {visiblePages.map((pageNumber) => (
              <Button
                key={pageNumber}
                onClick={() => navigate({ page: pageNumber })}
                className={`flex h-10 w-10 items-center justify-center rounded-xl font-semibold transition ${
                  currentPage === pageNumber
                    ? "bg-primary text-white"
                    : "border border-border hover:bg-muted"
                }`}
              >
                {pageNumber}
              </Button>
            ))}
          </div>

          <Button
            onClick={() => navigate({ page: Math.min(totalPages, currentPage + 1) })}
            disabled={currentPage === totalPages || isSinglePage}
            className="flex h-9 min-w-9 items-center justify-center rounded-xl border border-border px-3 transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:min-w-10 sm:px-0"
            aria-label="Next page" variant="secondary"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => navigate({ page: totalPages })}
            disabled={currentPage === totalPages || isSinglePage}
            className="hidden h-9 w-9 items-center justify-center rounded-xl border border-border transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
            aria-label="Last page" variant="secondary"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
