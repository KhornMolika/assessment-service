"use client";

import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { PaginationLimitSelect } from "./PaginationLimitSelect";
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

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  pageSizeOptions = [5, 10, 20, 50],
  itemLabel,
  onPageChange,
  onPageSizeChange,
  pathname,
  searchParams,
  defaultPageSize = 10,
}: {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  itemLabel: string;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pathname?: string;
  searchParams?: Record<string, string | null | undefined>;
  defaultPageSize?: number;
}) {
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

  const router = useRouter();
  const [, startTransition] = useTransition();

  const navigate = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      if (pathname && searchParams) {
        const href = buildHref({ pathname, searchParams, updates, defaultPageSize });
        startTransition(() => {
          router.push(href, { scroll: false });
        });
      }
    },
    [defaultPageSize, pathname, router, searchParams, startTransition],
  );

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      navigate({ page });
    }
  };

  const handlePageSizeChange = (size: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(size);
    } else {
      navigate({ pageSize: size, page: null });
    }
  };

  return (
    <div className="flex flex-col gap-4 border-t border-border px-4 py-4 sm:px-6">
      <div className="flex flex-row items-center justify-between gap-3">
        <div className="flex flex-row items-center gap-2 text-sm text-inkd">
          <span className="whitespace-nowrap">Show</span>
          <PaginationLimitSelect
            value={pageSize}
            options={pageSizeOptions}
            onChange={handlePageSizeChange}
          />
        </div>

        <div className="flex items-center justify-end text-sm text-inkd">
          <span className="whitespace-nowrap">
            Page {Math.min(currentPage, Math.max(totalPages, 1))} of {Math.max(totalPages, 1)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1 || isSinglePage}
          className="hidden h-9 min-w-9 items-center justify-center rounded-xl border border-border transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 sm:flex sm:h-10 sm:min-w-10 sm:px-0"
          aria-label="First page" variant="secondary"
        >
          <ChevronsLeft className="h-5 w-5" />
        </Button>
        <Button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || isSinglePage}
          className="flex h-9 min-w-9 items-center justify-center rounded-xl border border-border px-2 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:min-w-10 sm:px-0"
          aria-label="Previous page" variant="secondary"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2 sm:hidden">
          {mobileVisiblePages.map((pageNumber) => (
            <Button
              key={`mobile-${pageNumber}`}
              onClick={() => handlePageChange(pageNumber)}
              className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
                currentPage === pageNumber
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "border border-border hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow-sm"
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
              onClick={() => handlePageChange(pageNumber)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl font-semibold transition ${
                currentPage === pageNumber
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "border border-border hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow-sm"
              }`}
            >
              {pageNumber}
            </Button>
          ))}
        </div>

        <Button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || isSinglePage}
          className="flex h-9 min-w-9 items-center justify-center rounded-xl border border-border px-2 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:min-w-10 sm:px-0"
          aria-label="Next page" variant="secondary"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        <Button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages || isSinglePage}
          className="hidden h-9 min-w-9 items-center justify-center rounded-xl border border-border transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 sm:flex sm:h-10 sm:min-w-10 sm:px-0"
          aria-label="Last page" variant="secondary"
        >
          <ChevronsRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
