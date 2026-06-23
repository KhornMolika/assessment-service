"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/src/lib/utils";

export type DropdownOption = {
  value: string;
  label: string;
};

export function DropdownSelect({
  value,
  options,
  onChange,
  className,
  searchable = false,
  searchPlaceholder = "Search...",
}: {
  value: string;
  options: DropdownOption[];
  onChange: (val: string) => void;
  className?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    } else if (searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [isOpen, searchable]);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(query));
  }, [options, searchable, searchQuery]);

  return (
    <div className={cn("relative w-full", className)} ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all focus:border-[#C8A246] focus:outline-none focus:ring-2 focus:ring-[#C8A246]/50"
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-150">
          {searchable && (
            <div className="border-b border-slate-100 p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-lg border-none bg-slate-50 py-2 pl-8 pr-3 text-sm text-slate-700 focus:bg-slate-100 focus:outline-none focus:ring-0"
                />
              </div>
            </div>
          )}
          
          <div className="max-h-[300px] overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-center text-sm text-slate-500">
                No results found
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 hover:text-primary ${
                    value === opt.value ? "bg-slate-50 font-bold text-primary" : "text-slate-600 font-medium"
                  }`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
