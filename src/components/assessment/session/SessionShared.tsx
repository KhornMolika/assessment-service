import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  LoaderCircle,
  MessageCircleMore,
  Share2,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import type { AssessmentCatalogItem } from "@/src/types";
import type { QuestionOption } from '@/src/types/session.types';
import { formatStartDate, getParticipantIdentityLabel } from '@/src/lib/session/session.utils';
import { Button } from "@/src/components/ui/ui/button";

const realtimeOptionPalettes = [
  {
    tileClassName:
      "border-[#F94144]/25 bg-[linear-gradient(135deg,#ff6b6f_0%,#f94144_100%)] text-white shadow-[0_18px_45px_rgba(249,65,68,0.28)]",
    selectedClassName: "ring-4 ring-[#FFD6D7]",
    badgeClassName: "bg-white/18 text-white",
  },
  {
    tileClassName:
      "border-[#277DA1]/25 bg-[linear-gradient(135deg,#4cc9f0_0%,#277DA1_100%)] text-white shadow-[0_18px_45px_rgba(39,125,161,0.28)]",
    selectedClassName: "ring-4 ring-[#CFEFFC]",
    badgeClassName: "bg-white/18 text-white",
  },
  {
    tileClassName:
      "border-[#F9C74F]/25 bg-[linear-gradient(135deg,#ffe08a_0%,#f9c74f_100%)] text-primary shadow-[0_18px_45px_rgba(249,199,79,0.32)]",
    selectedClassName: "ring-4 ring-[#FFF1C8]",
    badgeClassName: "bg-white/55 text-primary",
  },
  {
    tileClassName:
      "border-[#43AA8B]/25 bg-[linear-gradient(135deg,#7fe0c0_0%,#43AA8B_100%)] text-white shadow-[0_18px_45px_rgba(67,170,139,0.28)]",
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
}: {
  eyebrow?: string;
  title: string;
  description: string;
  headerAction?: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
  variant?: "page" | "panel";
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
    <main className="min-h-dvh overflow-x-hidden bg-[radial-gradient(circle_at_top,#d8f3dc,transparent_38%),linear-gradient(180deg,#f7f5f0_0%,#f2ede2_100%)] px-3 py-3 sm:px-4 sm:py-4 lg:h-[100dvh] lg:overflow-hidden lg:px-6 lg:py-6">
      <div className="mx-auto flex min-h-[calc(100dvh-1.5rem)] max-w-7xl flex-col gap-4 lg:h-full lg:min-h-0 lg:gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col lg:min-h-0">
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
          <div className={`${hasHeader ? "mt-4 lg:mt-6" : ""} flex flex-col flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-1`}>
            {children}
          </div>
        </div>

        {aside ? <aside className="w-full shrink-0 lg:w-100">{aside}</aside> : null}
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
        className={`rt-answer-tile flex w-full items-center gap-4 rounded-[26px] border px-5 py-5 text-left transition ${
          palette.tileClassName
        } ${selected ? palette.selectedClassName : ""} ${
          disabled ? "cursor-not-allowed opacity-65" : ""
        }`}
      >
        <span
          className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-black ${palette.badgeClassName}`}
        >
          {option.label}
        </span>
        <span className="text-base font-bold leading-6 sm:text-lg">{option.text}</span>
      </Button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`group relative flex w-full items-center gap-5 rounded-2xl border-2 p-3.5 text-left transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 ${
        selected
          ? "border-primary bg-primary/3 shadow-md shadow-primary/10"
          : "border-border/60 bg-white hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white hover:shadow-lg hover:shadow-primary/5"
      } ${disabled ? "cursor-not-allowed opacity-60 hover:-translate-y-0 hover:shadow-none" : ""}`}
    >
      <span
        className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold transition-all duration-300 ${
          selected
            ? "bg-primary text-white shadow-md shadow-primary/30 scale-110"
            : "bg-muted text-primary group-hover:bg-primary/10 group-hover:text-primary"
        }`}
      >
        {option.label}
      </span>
      <span className={`text-base font-medium leading-relaxed transition-colors duration-300 ${
        selected ? "text-primary" : "text-inkd group-hover:text-primary"
      }`}>
        {option.text}
      </span>
      
      {/* Selection Indicator */}
      <div className={`ml-auto flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-300 ${
        selected 
          ? "border-primary bg-primary text-white scale-100 opacity-100" 
          : "border-border/60 scale-75 opacity-0 group-hover:border-primary/30 group-hover:opacity-50"
      }`}>
        <CheckCircle2 className="h-4 w-4" />
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

const shareDestinations = [
  {
    name: "Facebook",
    caption: "Share a result card with the answer sheet link.",
    icon: "f",
    iconClassName: "bg-[#1877F2] text-white",
  },
  {
    name: "Telegram",
    caption: "Send your score and answer sheet directly to chats or groups.",
    icon: "T",
    iconClassName: "bg-[#229ED9] text-white",
  },
  {
    name: "LinkedIn",
    caption: "Post a polished assessment result update to your network.",
    icon: "in",
    iconClassName: "bg-[#0A66C2] text-white",
  },
] as const;

export function ShareAnswerSheetPanel({ enabled }: { enabled: boolean }) {
  return (
    <div className="rounded-[28px] border border-border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
            Share answer sheet
          </p>
          <h3 className="mt-2 text-xl font-bold text-primary">Send your result anywhere it helps</h3>
          <p className="mt-2 text-sm leading-6 text-inkd">
            Share the score summary together with the your answer response and the
            correct answers when they are shown.
          </p>
        </div>
        <div className="rounded-2xl bg-[#D8F3DC] p-3 text-primary">
          <Share2 className="h-5 w-5" />
        </div>
      </div>

      {enabled ? (
        <div className="mt-5 grid gap-3 xl:grid-cols-3">
          {shareDestinations.map((destination) => (
            <Button
              key={destination.name}
              type="button"
              className="group rounded-3xl border border-border bg-muted/15 p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-white hover:shadow-sm" variant="secondary"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`inline-flex h-11 min-w-11 items-center justify-center rounded-2xl text-sm font-bold ${destination.iconClassName}`}
                >
                  {destination.icon}
                </span>
                <ExternalLink className="h-4 w-4 text-primary/45 transition group-hover:text-primary" />
              </div>
              <p className="mt-4 text-base font-semibold text-primary">{destination.name}</p>
              <p className="mt-2 text-sm leading-6 text-inkd">{destination.caption}</p>
            </Button>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/15 p-4 text-sm leading-6 text-inkd">
          Sharing is disabled for this assessment, so participants can review the answer sheet here
          but cannot send it to social channels.
        </div>
      )}

      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-muted/20 px-3 py-2 text-xs font-semibold text-primary/70">
        <MessageCircleMore className="h-4 w-4" />
        Supported targets: Facebook, Telegram, LinkedIn
      </div>
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
    <div className="mx-auto max-w-3xl rounded-[36px] border border-white/70 bg-[linear-gradient(180deg,#ffffff_0%,#f4f0e5_100%)] p-8 shadow-xl sm:p-10">
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
