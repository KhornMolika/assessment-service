"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export function PaginationLimitSelect({
  value,
  options,
  onChange,
}: {
  value: number;
  options: number[];
  onChange: (val: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-flex items-center shadow-sm" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-32.5 items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-1 text-sm font-semibold text-primary transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-0"
      >
        <span className="truncate">{value} / page</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-primary transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full z-50 mb-2 flex w-full origin-bottom flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="flex-1 py-1.5">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center text-left px-3 py-2 text-sm transition-colors hover:bg-slate-50 hover:text-primary ${
                  value === opt ? "bg-slate-50 font-semibold text-primary" : "text-ink"
                }`}
              >
                {opt} / page
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
