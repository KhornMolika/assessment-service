import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Info, ShieldCheck } from "lucide-react";
import { TimeLimitCard } from "../SessionShared";
import { Label } from "@/src/components/ui/ui/label";
import { Button } from "@/src/components/ui/ui/button";
import { Input } from "@/src/components/ui/ui/input";

export function SelfPacedEntry({
  heading,
  description,
  timeLimitMinutes,
  requiresDisplayName,
  displayName,
  onDisplayNameChange,
  email,
  onEmailChange,
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
  email: string;
  onEmailChange: (value: string) => void;
  helperTitle: string;
  helperDescription: string;
  ctaLabel: string;
  onContinue: () => void;
  backHref?: string;
  backLabel?: string;
  showBackButton?: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-[24px] border border-border bg-white p-5 shadow-sm sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-inkd">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Entry form
          </div>
          <h2 className="mt-5 text-3xl font-bold leading-tight text-primary sm:text-4xl">
            {heading}
          </h2>
          {description ? (
            <p className="mt-4 max-w-2xl text-sm leading-6 text-inkd">{description}</p>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                Identity
              </p>
              <p className="mt-2 text-sm font-semibold text-primary">{requiresDisplayName ? "Required" : "Managed"}</p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                Mode
              </p>
              <p className="mt-2 text-sm font-semibold text-primary">Self-paced</p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                Timer
              </p>
              <p className="mt-2 text-sm font-semibold text-primary">
                {timeLimitMinutes > 0 ? `${timeLimitMinutes} min` : "No limit"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm leading-6 text-inkd">
              Your answers save as you move through the quiz. Review everything once before submission.
            </p>
          </div>
        </div>

        <div className="rounded-[24px] border border-border bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#D8F3DC] px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" />
                Participant setup
              </div>
            </div>
            {timeLimitMinutes > 0 ? <TimeLimitCard minutes={timeLimitMinutes} compact /> : null}
          </div>

          <div className="mt-6 grid gap-4">
            {requiresDisplayName ? (
              <div className="space-y-4">
                <Label className="block space-y-2">
                  <span className="text-sm font-semibold text-primary">Display name</span>
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(event) => onDisplayNameChange(event.target.value)}
                    placeholder="Enter your display name"
                    className="h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm text-primary outline-none transition placeholder:text-primary/35 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </Label>
                <Label className="block space-y-2">
                  <span className="text-sm font-semibold text-primary">Email address</span>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => onEmailChange(event.target.value)}
                    placeholder="Enter your email address"
                    className="h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm text-primary outline-none transition placeholder:text-primary/35 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </Label>
              </div>
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
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Link>
            ) : null}
            <Button
              type="button"
              disabled={requiresDisplayName && (displayName.trim().length === 0 || email.trim().length === 0)}
              onClick={onContinue}
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-pm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
