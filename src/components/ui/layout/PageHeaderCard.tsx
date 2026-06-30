import type { ReactNode } from "react";
import { BackButton } from "@/src/components/ui/navigation/BackButton";

export function PageHeaderCard({
  title,
  description,
  actions,
  backHref,
  backLabel,
  meta,
  children,
  className = "",
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  meta?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "page-header-card flex flex-col gap-3 rounded-2xl border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,250,248,0.96)_100%)] dark:bg-card dark:bg-none p-5 shadow-sm sm:p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          {meta ? <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">{meta}</div> : null}
          <div className="flex items-center gap-4">
            {backHref ? <BackButton href={backHref} label={backLabel} /> : null}
            <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl md:text-4xl">
              {title}
            </h1>
          </div>
          {description ? (
            <div className="mt-3 max-w-4xl text-sm leading-7 text-inkl sm:text-base">
              {description}
            </div>
          ) : null}
          {children ? <div className="mt-4">{children}</div> : null}
        </div>
        {actions ? <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">{actions}</div> : null}
      </div>
    </div>
  );
}
