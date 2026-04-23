import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
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
    <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#D8F3DC] px-3 py-1 text-xs font-semibold text-primary">
          <ShieldCheck className="h-4 w-4" />
          Entry form
        </div>
        <h2 className="mt-4 text-3xl font-bold text-primary">{heading}</h2>
        {description ? <p className="mt-3 text-sm leading-6 text-inkd">{description}</p> : null}
      </div>

      <div className="space-y-4 rounded-[28px] border border-border bg-muted/20 p-5">
        {timeLimitMinutes > 0 ? <TimeLimitCard minutes={timeLimitMinutes} compact /> : null}

        {requiresDisplayName ? (
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-primary">Display name</span>
            <input
              type="text"
              value={displayName}
              onChange={(event) => onDisplayNameChange(event.target.value)}
              placeholder="Enter your display name"
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-primary"
            />
          </label>
        ) : (
          <div className="rounded-2xl bg-white p-4 ring-1 ring-border">
            <p className="text-sm font-semibold text-primary">{helperTitle}</p>
            <p className="mt-2 text-sm text-inkd">{helperDescription}</p>
          </div>
        )}

        {requiresDisplayName ? (
          <div className="flex items-center justify-between rounded-2xl bg-white p-4 ring-1 ring-border">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                Validation
              </p>
              <p className="mt-2 text-sm text-inkd">Display name is required before the quiz begins.</p>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
          {showBackButton && backHref && backLabel ? (
            <Link
              href={backHref}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          ) : null}
          <button
            type="button"
            disabled={requiresDisplayName && displayName.trim().length === 0}
            onClick={onContinue}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
