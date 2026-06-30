import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck, Clock, User, CheckCircle2 } from "lucide-react";
import { Label } from "@/src/components/ui/ui/label";
import { Button } from "@/src/components/ui/ui/button";
import { Input } from "@/src/components/ui/ui/input";

export function SelfPacedEntry({
  heading,
  description,
  timeLimitMinutes,
  requiresIdentity,
  displayName,
  onDisplayNameChange,
  email,
  onEmailChange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  helperTitle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  requiresIdentity: boolean;
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
    <div className="mx-auto flex w-full max-w-2xl my-auto flex-col items-center justify-center">
      <div className="w-full overflow-hidden rounded-[32px] border border-border/60 bg-white/70 shadow-2xl shadow-primary/5 backdrop-blur-xl">
        
        {/* Header Section */}
        <div className="border-b border-border/50 bg-gradient-to-b from-primary/[0.03] to-transparent p-6 text-center sm:p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            {heading}
          </h2>
          {description ? (
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-inkd">
              {description}
            </p>
          ) : null}

          {/* Inline Badges */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-border/80 bg-white px-4 py-1.5 text-xs font-semibold text-primary shadow-sm">
              <User className="h-4 w-4 text-primary/70" />
              {requiresIdentity ? "Identity required" : "Anonymous session"}
            </div>
            {timeLimitMinutes > 0 && (
              <div className="flex items-center gap-2 rounded-full border border-border/80 bg-white px-4 py-1.5 text-xs font-semibold text-primary shadow-sm">
                <Clock className="h-4 w-4 text-primary/70" />
                {timeLimitMinutes} min limit
              </div>
            )}
          </div>
        </div>

        {/* Form Section */}
        <div className="p-6 sm:p-8">
          {requiresIdentity ? (
            <div className="space-y-5">
              <div className="space-y-4">
                <Label className="block space-y-2">
                  <span className="text-sm font-semibold text-primary">Display Name</span>
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(event) => onDisplayNameChange(event.target.value)}
                    placeholder="Enter your name"
                    className="h-12 w-full rounded-2xl border-2 border-border/60 bg-white px-4 text-sm text-primary outline-none transition placeholder:text-primary/30 hover:border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </Label>
                <Label className="block space-y-2">
                  <span className="text-sm font-semibold text-primary">Email Address</span>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => onEmailChange(event.target.value)}
                    placeholder="Enter your email"
                    className="h-12 w-full rounded-2xl border-2 border-border/60 bg-white px-4 text-sm text-primary outline-none transition placeholder:text-primary/30 hover:border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </Label>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <p className="text-sm leading-relaxed text-blue-900/80">
                  Your identity helps us prevent duplicate entries and ensures your answers are securely associated with your email.
                </p>
              </div>
            </div>
          ) : null}

          <div className={requiresIdentity ? "mt-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between" : "flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between"}>
            {showBackButton && backHref && backLabel ? (
              <Link
                href={backHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-border/60 px-5 text-sm font-semibold text-primary transition hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Link>
            ) : <div />}
            <Button
              type="button"
              disabled={requiresIdentity && (displayName.trim().length === 0 || email.trim().length === 0)}
              onClick={onContinue}
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/95 hover:shadow-xl hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none sm:w-auto"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
