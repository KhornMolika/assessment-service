import Link from "next/link";
import { ArrowLeft, ArrowRight, Info, ShieldCheck } from "lucide-react";
import { TimeLimitCard } from "../SessionShared";

export function SelfPacedEntry({
  heading,
  description,
  timeLimitMinutes,
  requiresDisplayName,
  displayName,
  onDisplayNameChange,
  helperTitle,
  helperDescription,
  ctaLabel,
  onContinue,
  backHref,
  backLabel,
  showBackButton,
}: {
  heading: string;
  description?: string;
  timeLimitMinutes: number;
  requiresDisplayName: boolean;
  displayName: string;
  onDisplayNameChange: (value: string) => void;
  helperTitle: string;
  helperDescription: string;
  ctaLabel: string;
  onContinue: () => void;
  backHref?: string;
  backLabel?: string;
  showBackButton?: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-[28px] border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#D8F3DC] px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" />
              Entry form
            </div>
            <h2 className="mt-4 text-2xl font-bold leading-tight text-primary sm:text-3xl">
              {heading}
            </h2>
            {description ? (
              <p className="mt-3 text-sm leading-6 text-inkd">{description}</p>
            ) : null}
          </div>
          {timeLimitMinutes > 0 ? (
            <div className="w-full sm:w-64">
              <TimeLimitCard minutes={timeLimitMinutes} compact />
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4">
          {requiresDisplayName ? (
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-primary">Display name</span>
              <input
                type="text"
                value={displayName}
                onChange={(event) => onDisplayNameChange(event.target.value)}
                placeholder="Enter your display name"
                className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm text-primary outline-none transition placeholder:text-primary/35 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
          ) : (
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <p className="text-sm font-semibold text-primary">{helperTitle}</p>
              <p className="mt-2 text-sm leading-6 text-inkd">{helperDescription}</p>
            </div>
          )}

          {requiresDisplayName ? (
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/20 p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary/65" />
              <p className="text-sm leading-6 text-inkd">
                Display name is required before the quiz begins.
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          {showBackButton && backHref && backLabel ? (
            <Link
              href={backHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          ) : null}
          <button
            type="button"
            disabled={requiresDisplayName && displayName.trim().length === 0}
            onClick={onContinue}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
