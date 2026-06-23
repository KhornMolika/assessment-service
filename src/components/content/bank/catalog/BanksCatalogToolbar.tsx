"use client";

import { Search } from "lucide-react";
import { useDebouncedSearchParam } from "@/src/hooks/use-url-query-state";
import { Input } from "@/src/components/ui/ui/input";

export default function BanksCatalogToolbar() {
  const { inputValue: searchQuery, setInputValue: setSearchQuery } =
    useDebouncedSearchParam({ key: "query" });

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-inkl" />
        <Input
          type="text"
          placeholder="Search banks"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-pm"
        />
      </div>
    </div>
  );
}
