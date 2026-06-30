"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function ThemeSwitch({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    if (
      typeof document !== "undefined" &&
      document.startViewTransition
    ) {
      document.startViewTransition(() => {
        setTheme(newTheme);
      });
    } else {
      setTheme(newTheme);
    }
  };

  const isDark = theme === "dark";

  if (!mounted) {
    // Return a placeholder to prevent hydration mismatch
    return (
      <div className={joinClasses("inline-flex items-center gap-2 p-1", className)}>
        <div className="relative inline-grid grid-cols-2 rounded-full bg-black/5 p-0.5">
          <div className="min-w-10 px-3 py-2"></div>
          <div className="min-w-10 px-3 py-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={joinClasses(
        "inline-flex items-center gap-2 p-1",
        className,
      )}
      role="group"
      aria-label="Theme switcher"
    >
      <div className="relative inline-grid grid-cols-2 rounded-full bg-black/5 p-0.5">
        <div
          className="pointer-events-none absolute bottom-0.5 top-0.5 rounded-full bg-primary shadow-[0_10px_24px_-16px_rgba(27,67,50,0.9)] transition-all duration-200"
          style={{
            width: `calc((100% - 0.25rem) / 2)`,
            left: isDark ? `calc(0.125rem + 1 * ((100% - 0.25rem) / 2))` : `calc(0.125rem)`,
          }}
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={() => handleThemeChange("light")}
          className={joinClasses(
            "relative z-10 flex min-w-10 items-center justify-center rounded-full px-3 py-2 transition-colors",
            !isDark ? "text-white" : "text-inkd hover:text-primary",
          )}
          aria-pressed={!isDark}
          aria-label="Light mode"
        >
          <Sun className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleThemeChange("dark")}
          className={joinClasses(
            "relative z-10 flex min-w-10 items-center justify-center rounded-full px-3 py-2 transition-colors",
            isDark ? "text-white" : "text-inkd hover:text-primary",
          )}
          aria-pressed={isDark}
          aria-label="Dark mode"
        >
          <Moon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
