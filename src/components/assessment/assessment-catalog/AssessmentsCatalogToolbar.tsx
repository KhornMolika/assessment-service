"use client";

import { Search } from "lucide-react";
import type { AssessmentDeliveryMode } from "@/src/types/assessment.types";
import {
  useDebouncedSearchParam,
  useUrlQueryUpdater,
} from "@/src/hooks/use-url-query-state";
import { Button } from "@/src/components/ui/ui/button";
import { DropdownSelect } from "@/src/components/ui/ui/dropdown-select";
import { Input } from "@/src/components/ui/ui/input";

export default function AssessmentsCatalogToolbar({
  deliveryFilter,
  typeFilter,
  statusFilter,
  selectionFilter,
}: {
  deliveryFilter: "ALL" | AssessmentDeliveryMode;
  typeFilter: string;
  statusFilter: string;
  selectionFilter: string;
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

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-40">
          <DropdownSelect
            value={typeFilter || "ALL"}
            options={[
              { value: "ALL", label: "All Types" },
              { value: "QUIZ", label: "Quiz" },
              { value: "EXAM", label: "Exam" },
              { value: "PRACTICE", label: "Practice" },
              { value: "SURVEY", label: "Survey" },
            ]}
            onChange={(val) => updateUrl({ type: val === "ALL" ? null : val, page: null })}
          />
        </div>

        <div className="w-40">
          <DropdownSelect
            value={deliveryFilter || "ALL"}
            options={[
              { value: "ALL", label: "All Modes" },
              { value: "SELF_PACED", label: "Self-Paced" },
              { value: "REAL_TIME", label: "Real-Time" },
            ]}
            onChange={(val) => updateUrl({ delivery: val === "ALL" ? null : val, page: null })}
          />
        </div>

        <div className="w-48">
          <DropdownSelect
            value={selectionFilter || "ALL"}
            options={[
              { value: "ALL", label: "All Selection" },
              { value: "MANUAL", label: "Manual" },
              { value: "DYNAMIC", label: "Dynamic" },
            ]}
            onChange={(val) => updateUrl({ selection: val === "ALL" ? null : val, page: null })}
          />
        </div>

        <div className="w-40">
          <DropdownSelect
            value={statusFilter || "ALL"}
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "DRAFT", label: "Draft" },
              { value: "PUBLISHED", label: "Published" },
              { value: "ARCHIVED", label: "Archived" },
            ]}
            onChange={(val) => updateUrl({ status: val === "ALL" ? null : val, page: null })}
          />
        </div>

        
      </div>
    </div>
  );
}
