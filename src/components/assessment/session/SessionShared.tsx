import * as React from "react";
import {
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  LoaderCircle,
  MessageCircleMore,
  Share2,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import type { AssessmentCatalogItem } from "@/src/types";
import type { QuestionOption } from '@/src/types/session.types';
import { formatStartDate, getParticipantIdentityLabel } from '@/src/lib/session/session.utils';
import { Button } from "@/src/components/ui/ui/button";

const realtimeOptionPalettes = [
  {
    tileClassName:
      "border-[#F94144]/25 bg-gradient-to-br from-[#ff6b6f] to-[#f94144] text-white shadow-[0_18px_45px_rgba(249,65,68,0.28)]",
    selectedClassName: "ring-4 ring-[#FFD6D7]",
    badgeClassName: "bg-white/18 text-white",
  },
  {
    tileClassName:
      "border-[#277DA1]/25 bg-gradient-to-br from-[#4cc9f0] to-[#277DA1] text-white shadow-[0_18px_45px_rgba(39,125,161,0.28)]",
    selectedClassName: "ring-4 ring-[#CFEFFC]",
    badgeClassName: "bg-white/18 text-white",
  },
  {
    tileClassName:
      "border-[#F9C74F]/25 bg-gradient-to-br from-[#ffe08a] to-[#f9c74f] text-primary shadow-[0_18px_45px_rgba(249,199,79,0.32)]",
    selectedClassName: "ring-4 ring-[#FFF1C8]",
    badgeClassName: "bg-white/55 text-primary",
  },
  {
    tileClassName:
      "border-[#43AA8B]/25 bg-gradient-to-br from-[#7fe0c0] to-[#43AA8B] text-white shadow-[0_18px_45px_rgba(67,170,139,0.28)]",
    selectedClassName: "ring-4 ring-[#D8F7EC]",
    badgeClassName: "bg-white/18 text-white",
  },
] as const;

export function getRealtimeOptionPalette(index: number) {
  return realtimeOptionPalettes[index % realtimeOptionPalettes.length];
}

export function ScreenShell({
  eyebrow,
  title,
  description,
  headerAction,
  aside,
  children,
  variant = "page",
  viewportLocked = false,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  headerAction?: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
  variant?: "page" | "panel";
  viewportLocked?: boolean;
}) {
  const hasHeader = Boolean(eyebrow || title || description);

  if (variant === "panel") {
    return (
      <>
        {children}
        {aside ? <aside className="space-y-4">{aside}</aside> : null}
      </>
    );
  }

  return (
    <main
      className={`bg-[radial-gradient(circle_at_top,#d8f3dc,transparent_38%),linear-gradient(180deg,#f7f5f0_0%,#f2ede2_100%)] dark:bg-card dark:bg-none px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6 ${
        viewportLocked ? "h-dvh overflow-hidden" : "min-h-dvh"
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl flex-col gap-4 lg:gap-6 lg:flex-row ${
          viewportLocked ? "h-full min-h-0" : "min-h-[calc(100dvh-1.5rem)]"
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          {hasHeader || headerAction ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                {eyebrow ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/65">
                    {eyebrow}
                  </p>
                ) : null}
                {title ? (
                  <h1 className="mt-2 max-w-4xl text-2xl font-bold leading-tight text-primary sm:text-3xl">
                    {title}
                  </h1>
                ) : null}
                {description ? (
                  <p className="mt-4 max-w-3xl text-sm leading-6 text-inkd sm:text-base">{description}</p>
                ) : null}
              </div>
              {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
            </div>
          ) : null}
          <div className={`${hasHeader ? "mt-4 lg:mt-6" : ""} flex min-h-0 flex-1 flex-col`}>
            {children}
          </div>
        </div>

        {aside ? (
          <aside className="w-full shrink-0 lg:w-100 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
            {aside}
          </aside>
        ) : null}
      </div>
    </main>
  );
}

export function OverviewCard({
  assessment,
}: {
  assessment: AssessmentCatalogItem;
}) {
  const items = [
    {
      label: "Starts",
      value: formatStartDate((assessment.settings?.startsAt) as string),
      icon: Clock3,
    },
    {
      label: "Questions",
      value: `${assessment.settings?.numQuestions ?? 0} items`,
      icon: Users,
    },
    {
      label: "Identity",
      value: getParticipantIdentityLabel(assessment.settings?.participantIdentity || "EXTERNAL"),
      icon: UserRound,
    },
  ];

  return (
    <div className="rounded-[28px] border border-white/70 bg-[#16352A] p-5 text-white shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
        Assessment Snapshot
      </p>
      <div className="mt-4 space-y-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/6 p-4"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#95D5B2]" />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">{item.label}</p>
                <p className="mt-1 text-sm font-semibold leading-5">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FlowStepper({
  steps,
  activeStep,
  compact = false,
}: {
  steps: string[];
  activeStep: number;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isComplete = index < activeStep;

          return (
            <div
              key={step}
              className={`inline-flex h-8 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition ${
                isActive
                  ? "border-primary bg-primary text-white"
                  : isComplete
                    ? "border-[#95D5B2] bg-[#D8F3DC] text-primary"
                    : "border-border bg-white text-inkd"
              }`}
            >
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-current/10 text-[10px]">
                {index + 1}
              </span>
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {steps.map((step, index) => {
        const isActive = index === activeStep;
        const isComplete = index < activeStep;

        return (
          <div
            key={step}
            className={`rounded-2xl border px-4 py-3 text-sm transition ${
              isActive
                ? "border-primary bg-primary text-white shadow-lg"
                : isComplete
                  ? "border-[#95D5B2] bg-[#D8F3DC] text-primary"
                  : "border-border bg-white text-inkd"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">
              Step {index + 1}
            </p>
            <p className="mt-1 font-semibold">{step}</p>
          </div>
        );
      })}
    </div>
  );
}

export function QuestionOptionButton({
  option,
  selected,
  disabled,
  onClick,
  variant = "default",
  paletteIndex = 0,
}: {
  option: QuestionOption;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  variant?: "default" | "realtime";
  paletteIndex?: number;
}) {
  const palette = getRealtimeOptionPalette(paletteIndex);

  if (variant === "realtime") {
    return (
      <Button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`rt-answer-tile flex w-full items-center gap-2 sm:gap-4 rounded-[26px] border px-2 py-2 sm:px-5 sm:py-5 text-left transition ${
          palette.tileClassName
        } ${selected ? palette.selectedClassName : ""} ${
          disabled ? "cursor-not-allowed opacity-65" : ""
        }`}
      >
        <span
          className={`inline-flex h-8 w-8 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl text-xs sm:text-base font-black ${palette.badgeClassName}`}
        >
          {option.label}
        </span>
        <span className="text-xs font-bold leading-tight sm:leading-6 sm:text-lg">{option.text}</span>
      </Button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 sm:gap-5 rounded-xl sm:rounded-2xl border-2 p-2.5 sm:p-3.5 text-left transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 ${
        selected
          ? "border-primary bg-primary/3 shadow-md shadow-primary/10"
          : "border-border/60 bg-white hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white hover:shadow-lg hover:shadow-primary/5"
      } ${disabled ? "cursor-not-allowed opacity-60 hover:-translate-y-0 hover:shadow-none" : ""}`}
    >
      <span
        className={`inline-flex h-8 w-8 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl text-xs sm:text-base font-bold transition-all duration-300 ${
          selected
            ? "bg-primary text-white shadow-md shadow-primary/30 scale-110"
            : "bg-muted text-primary group-hover:bg-primary/10 group-hover:text-primary"
        }`}
      >
        {option.label}
      </span>
      <span className={`text-sm sm:text-base font-medium leading-tight sm:leading-relaxed transition-colors duration-300 ${
        selected ? "text-primary" : "text-inkd group-hover:text-primary"
      }`}>
        {option.text}
      </span>
      
      {/* Selection Indicator */}
      <div className={`ml-auto flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border-2 transition-all duration-300 ${
        selected 
          ? "border-primary bg-primary text-white scale-100 opacity-100" 
          : "border-border/60 scale-75 opacity-0 group-hover:border-primary/30 group-hover:opacity-50"
      }`}>
        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </div>
    </button>
  );
}

export function TimeLimitCard({
  minutes,
  compact,
}: {
  minutes: number;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-white ${
        compact ? "p-3" : "p-5"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`${compact ? "rounded-xl p-2" : "rounded-2xl p-3"} bg-[#D8F3DC] text-primary`}>
          <Clock3 className={compact ? "h-4 w-4" : "h-5 w-5"} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
            Time limit
          </p>
          <p className={`${compact ? "mt-1 text-base" : "mt-2 text-lg"} font-bold text-primary`}>
            {minutes} minute{minutes === 1 ? "" : "s"}
          </p>
          <p className={`${compact ? "hidden" : "mt-1"} text-sm leading-6 text-inkd`}>
            Submit before the timer expires. The timer begins when the assessment starts.
          </p>
        </div>
      </div>
    </div>
  );
}

export function QuizTimerCard({
  timeLabel,
  progressPercent,
}: {
  timeLabel: string;
  progressPercent: number;
}) {
  return (
    <div className="rounded-[28px] border border-border bg-[#16352A] p-5 text-white shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
        Time remaining
      </p>
      <div className="mt-4 flex items-center gap-3">
        <div className="rounded-2xl bg-white/10 p-3 text-[#95D5B2]">
          <Clock3 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-3xl font-bold">{timeLabel}</p>
          <p className="mt-1 text-sm text-white/70">
            Keep moving. The timer continues while this question is open.
          </p>
        </div>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#95D5B2_0%,#52B788_100%)] transition"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
  </svg>
);

const shareDestinations = [
  {
    name: "Facebook",
    caption: "Share a result card with the answer sheet link.",
    icon: <FacebookIcon className="w-5 h-5" />,
    iconClassName: "bg-[#E7F6EA] text-[#1877F2]",
  },
  {
    name: "Telegram",
    caption: "Send your score and answer sheet directly to chats or groups.",
    icon: <TelegramIcon className="w-5 h-5" />,
    iconClassName: "bg-[#EAF4F1] text-[#2CA5E0]",
  },
  {
    name: "LinkedIn",
    caption: "Post a polished assessment result update to your network.",
    icon: <LinkedInIcon className="w-5 h-5" />,
    iconClassName: "bg-[#EEF3E6] text-[#0A66C2]",
  },
] as const;

export function ShareAnswerSheetPanel({
  enabled,
  title,
  description,
  shareUrl = "",
  compact = false,
  onClose,
}: {
  enabled: boolean;
  title?: string;
  description?: string;
  shareUrl?: string;
  compact?: boolean;
  onClose?: () => void;
}) {
  const absoluteShareUrl = typeof window !== "undefined" && shareUrl.startsWith("/") 
    ? `${window.location.origin}${shareUrl}`
    : shareUrl;
  const encodedUrl = encodeURIComponent(absoluteShareUrl);
  const getHref = (name: string) => {
    switch (name) {
      case "Facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      case "Telegram":
        return `https://t.me/share/url?url=${encodedUrl}`;
      case "LinkedIn":
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      default:
        return "#";
    }
  };

  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(absoluteShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={
        compact
          ? "w-full rounded-2xl border border-[#D7E4DA] bg-[#FBFCF7]/90 p-3 shadow-[0_12px_28px_rgba(27,67,50,0.07)] backdrop-blur sm:p-4"
          : "w-full rounded-3xl border border-white/60 bg-white p-6 shadow-2xl sm:p-8 relative overflow-hidden"
      }
    >
      {/* Decorative top accent */}
      {!compact && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-emerald-400 via-primary to-emerald-600" />
      )}

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600/80">
            Share Answer Sheet
          </p>
          <h3 className={compact ? "mt-1 text-base font-bold leading-tight text-primary" : "mt-1.5 text-2xl font-black leading-tight text-slate-900 tracking-tight"}>
            {title || "Answer sheet"}
          </h3>
          <p className={compact ? "mt-1 max-w-md text-xs leading-5 text-inkd" : "mt-1 text-sm leading-relaxed text-slate-500"}>
            {description || "Share your beautiful result card with others."}
          </p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Share2 className="h-5 w-5" />
          </div>
        )}
      </div>

      {enabled ? (
        <>
          {/* Social Share Buttons */}
          <div className={compact ? "mt-4 grid gap-2" : "mt-6 grid grid-cols-3 gap-3"}>
            {shareDestinations.map((destination) => (
              <a
                key={destination.name}
                href={getHref(destination.name)}
                target="_blank"
                rel="noopener noreferrer"
                className={compact
                  ? "group flex min-h-[3.75rem] items-center gap-2.5 rounded-xl border border-[#DDE6DC] bg-white/72 p-2.5 text-left transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:shadow-sm"
                  : "group flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center transition-all hover:-translate-y-1 hover:border-emerald-200 hover:bg-white hover:shadow-md"
                }
              >
                <span
                  className={`${compact ? "inline-flex h-8 w-8" : "inline-flex h-12 w-12"} shrink-0 items-center justify-center rounded-xl text-xs font-bold ${destination.iconClassName}`}
                >
                  {destination.icon}
                </span>
                <div className={compact ? "min-w-0 flex-1" : ""}>
                  <div className={compact ? "flex items-center justify-between gap-2" : "flex items-center justify-center gap-1"}>
                    <p className={compact ? "text-sm font-bold leading-tight text-primary" : "text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors"}>
                      {destination.name}
                    </p>
                    <ExternalLink className={compact ? "h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:text-emerald-500" : "h-3 w-3 text-slate-400 group-hover:text-emerald-500 transition-colors"} />
                  </div>
                  {!compact && (
                    <p className="mt-0.5 text-xs leading-4 text-slate-400 line-clamp-2">{destination.caption}</p>
                  )}
                  {compact && (
                    <p className="mt-0.5 line-clamp-1 text-[11px] leading-4 text-inkd">{destination.caption}</p>
                  )}
                </div>
              </a>
            ))}
          </div>

          {/* Copy Link */}
          {!compact && shareUrl && (
            <div className="mt-5 flex flex-col gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Or copy link to share</p>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 transition-all focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/20">
                <div className="flex-1 overflow-hidden px-3">
                  <p className="truncate text-sm text-slate-600 select-all font-mono">{absoluteShareUrl}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white transition-colors hover:bg-emerald-700 focus:outline-none"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    "Copy Link"
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-medium leading-relaxed text-slate-500 text-center">
          Sharing is disabled for this assessment. Participants can review their answers here but cannot share results.
        </div>
      )}
    </div>
  );
}

export function ProcessingAnswersCard({
  title = "Processing your answers",
  description = "We are checking your responses and preparing the final result view.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl rounded-[36px] border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#f4f0e5_100%)] dark:bg-card dark:bg-none p-8 shadow-xl sm:p-10">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-[linear-gradient(180deg,#dcf6df_0%,#cbeccd_100%)] text-primary shadow-inner shadow-[#95D5B2]/50">
          <div className="relative">
            <LoaderCircle className="h-11 w-11 animate-spin" />
            <Sparkles className="absolute -right-2 -top-2 h-4 w-4" />
          </div>
        </div>

        <h2 className="mt-8 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-base leading-7 text-inkd sm:text-lg">{description}</p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <span className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
          <span className="h-3 w-3 animate-bounce rounded-full bg-primary/75 [animation-delay:-0.1s]" />
          <span className="h-3 w-3 animate-bounce rounded-full bg-primary/55" />
        </div>

        <div className="mt-8 overflow-hidden rounded-full bg-[#D9DFE7]">
          <div className="h-3 w-2/3 rounded-full bg-[linear-gradient(90deg,#40916C_0%,#52B788_100%)] shadow-[0_0_18px_rgba(82,183,136,0.45)]" />
        </div>

        <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
              Step 1
            </p>
            <p className="mt-2 text-sm font-semibold text-primary">Validate submission</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
              Step 2
            </p>
            <p className="mt-2 text-sm font-semibold text-primary">Score each response</p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
              Step 3
            </p>
            <p className="mt-2 text-sm font-semibold text-primary">Build answer sheet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
