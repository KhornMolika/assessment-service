"use client";

import { Search } from "lucide-react";
import { useUrlQueryUpdater, useDebouncedSearchParam } from "@/src/hooks/use-url-query-state";
import { Input } from "@/src/components/ui/ui/input";
import { DropdownSelect } from "@/src/components/ui/ui/dropdown-select";

function formatEnumText(text: string) {
  if (text === "All Types") return "All Types";
  if (text === "All Difficulties") return "All Difficulties";
  if (text === "FILL_IN_THE_BLANK") return "Fill in the Blank";
  if (text === "TRUE_FALSE") return "True/False";
  return text
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export default function QuestionsCatalogToolbar({
  availableTypes,
  typeFilter,
  difficultyFilter,
}: {
  availableTypes: string[];
  typeFilter: string;
  difficultyFilter: string;
}) {
  const updateUrl = useUrlQueryUpdater();
  const { inputValue: searchQuery, setInputValue: setSearchQuery } = useDebouncedSearchParam({ key: "query" });

  const typeOptions = ["All Types", ...availableTypes].map(t => ({
    value: t,
    label: formatEnumText(t)
  }));

  const diffOptions = ["All Difficulties", "EASY", "MEDIUM", "HARD"].map(d => ({
    value: d,
    label: formatEnumText(d)
  }));

  return (
    <div className="grid gap-4 px-4 pt-4 sm:px-6 sm:pt-6 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C8A246]/50 focus:border-[#C8A246] shadow-sm transition-all"
        />
      </div>

      <DropdownSelect
        value={typeFilter}
        options={typeOptions}
        onChange={(val) => {
          updateUrl({
            type: val === "All Types" ? null : val,
            page: null,
          });
        }}
      />

      <DropdownSelect
        value={difficultyFilter}
        options={diffOptions}
        onChange={(val) => {
          updateUrl({
            difficulty: val === "All Difficulties" ? null : val,
            page: null,
          });
        }}
      />
    </div>
  );
}
