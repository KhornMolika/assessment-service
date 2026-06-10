"use client";

import { Search } from "lucide-react";
import type { AssessmentDeliveryMode } from "@/src/types/assessment.types";
import {
  useDebouncedSearchParam,
  useUrlQueryUpdater,
} from "@/src/hooks/use-url-query-state";
import { Button } from "@/src/components/ui/ui/button";
import { Input } from "@/src/components/ui/ui/input";

const deliveryFilters: Array<{
  label: string;
  value: "ALL" | AssessmentDeliveryMode;
}> = [
  { label: "All", value: "ALL" },
  { label: "Self-paced", value: "SELF_PACED" },
  { label: "Real-time", value: "REAL_TIME" },
];

export default function AssessmentsCatalogToolbar({
  deliveryFilter,
}: {
  deliveryFilter: "ALL" | AssessmentDeliveryMode;
}) {
  const updateUrl = useUrlQueryUpdater();
  const { inputValue: searchQuery, setInputValue: setSearchQuery } =
    useDebouncedSearchParam({ key: "query" });

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-inkl" />
        <Input
          type="text"
          placeholder="Search assessments by title, bank, or description..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-pm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {deliveryFilters.map((filter) => {
          const isActive = filter.value === deliveryFilter;

          return (
            <Button
              key={filter.value}
              type="button"
              onClick={() => {
                updateUrl({
                  delivery: filter.value === "ALL" ? null : filter.value,
                  page: null,
                });
              }}
              className={`inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-primary hover:bg-muted"
              }`}
            >
              {filter.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
