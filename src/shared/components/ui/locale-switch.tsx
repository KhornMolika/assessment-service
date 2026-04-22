"use client";

import { Globe } from "lucide-react";

type LocaleOption = {
  label: string;
  value: string;
};

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function LocaleSwitch({
  value,
  options,
  onChange,
  className,
}: {
  value: string;
  options: LocaleOption[];
  onChange: (nextValue: string) => void;
  className?: string;
}) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  return (
    <div
      className={joinClasses(
        "inline-flex items-center gap-2 rounded-full border border-border/80 bg-linear-to-r from-white via-muted/75 to-accl/55 p-1 shadow-sm",
        className,
      )}
      role="group"
      aria-label="Locale switcher"
    >
      <div className="pointer-events-none flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-inkl shadow-sm ring-1 ring-border/60">
        <Globe className="h-4 w-4" />
      </div>

      <div className="relative inline-grid grid-cols-2 rounded-full bg-black/5 p-0.5">
        <div
          className="pointer-events-none absolute bottom-0.5 top-0.5 rounded-full bg-primary shadow-[0_10px_24px_-16px_rgba(27,67,50,0.9)] transition-all duration-200"
          style={{
            width: `calc((100% - 0.25rem) / ${options.length})`,
            left: `calc(0.125rem + ${activeIndex} * ((100% - 0.25rem) / ${options.length}))`,
          }}
          aria-hidden="true"
        />

        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={joinClasses(
                "relative z-10 min-w-14 rounded-full px-3 py-2 text-sm font-semibold tracking-[0.08em] transition-colors",
                isActive ? "text-white" : "text-inkd hover:text-primary",
              )}
              aria-pressed={isActive}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
