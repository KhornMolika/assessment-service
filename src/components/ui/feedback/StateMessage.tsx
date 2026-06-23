import type { ReactNode } from "react";
import { AlertTriangle, FileSearch, SearchX } from "lucide-react";

type StateTone = "empty" | "not-found" | "error" | "warning";

const toneConfig: Record<
  StateTone,
  {
    icon: ReactNode;
    iconClassName: string;
    panelClassName: string;
  }
> = {
  empty: {
    icon: <SearchX className="h-5 w-5" />,
    iconClassName: "bg-[rgba(15,88,62,0.12)] text-primary",
    panelClassName: "border-border/80 bg-muted/30",
  },
  "not-found": {
    icon: <FileSearch className="h-5 w-5" />,
    iconClassName: "bg-slate-100 text-slate-500",
    panelClassName: "border-slate-200 bg-slate-50",
  },
  error: {
    icon: <AlertTriangle className="h-5 w-5" />,
    iconClassName: "bg-red-50 text-red-600",
    panelClassName: "border-red-200 bg-red-50/50",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    iconClassName: "bg-[#F4A261]/20 text-[#A85A14]",
    panelClassName: "border-[#F4A261]/40 bg-[#F4A261]/5",
  },
};

export function StateMessage({
  title,
  description,
  tone = "empty",
  action,
  className = "",
}: {
  title: string;
  description: ReactNode;
  tone?: StateTone;
  action?: ReactNode;
  className?: string;
}) {
  const config = toneConfig[tone];

  return (
    <div
      className={[
        "rounded-3xl border border-dashed p-6 sm:p-8",
        config.panelClassName,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <div
            className={[
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
              config.iconClassName,
            ].join(" ")}
          >
            {config.icon}
          </div>
          <div className="min-w-0 space-y-2">
            <h2 className="text-lg font-bold text-primary">{title}</h2>
            <div className="max-w-2xl text-sm leading-6 text-inkd">
              {description}
            </div>
          </div>
        </div>
        {action ? <div className="flex shrink-0 flex-wrap gap-3">{action}</div> : null}
      </div>
    </div>
  );
}
