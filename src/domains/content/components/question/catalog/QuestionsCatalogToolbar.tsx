"use client";

import { Search } from "lucide-react";
import { useUrlQueryUpdater, useDebouncedSearchParam } from "@/src/shared/hooks/use-url-query-state";

export default function QuestionsCatalogToolbar({
  availableTypes,
  availableBanks,
  typeFilter,
  bankFilter,
}: {
  availableTypes: string[];
  availableBanks: string[];
  typeFilter: string;
  bankFilter: string;
}) {
  const updateUrl = useUrlQueryUpdater();
  const { inputValue: searchQuery, setInputValue: setSearchQuery } =
    useDebouncedSearchParam({ key: "query" });

  return (
    <div className="grid gap-4 px-4 pt-4 sm:px-6 sm:pt-6 lg:grid-cols-[minmax(0,1fr)_220px_260px]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-inkl" />
        <input
          type="text"
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-pm"
        />
      </div>

      <select
        value={typeFilter}
        onChange={(event) => {
          updateUrl({
            type: event.target.value === "All Types" ? null : event.target.value,
            page: null,
          });
        }}
        className="rounded-lg border border-border bg-card px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pm"
      >
        <option>All Types</option>
        {availableTypes.map((type) => (
          <option key={type}>{type}</option>
        ))}
      </select>

      <select
        value={bankFilter}
        onChange={(event) => {
          updateUrl({
            bank: event.target.value === "All Banks" ? null : event.target.value,
            page: null,
          });
        }}
        className="rounded-lg border border-border bg-card px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pm"
      >
        <option>All Banks</option>
        {availableBanks.map((bankName) => (
          <option key={bankName}>{bankName}</option>
        ))}
      </select>
    </div>
  );
}
