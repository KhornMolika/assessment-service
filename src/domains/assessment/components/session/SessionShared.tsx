import {
  Clock3,
  ExternalLink,
  LoaderCircle,
  MessageCircleMore,
  Share2,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import type { AssessmentCatalogItem } from "@/src/domains/assessment/types";
import type { QuestionOption } from "./session.types";
import { formatStartDate, getParticipantIdentityLabel } from "./session.utils";

export function ScreenShell({
  eyebrow,
  title,
  description,
  aside,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  aside: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#d8f3dc,transparent_38%),linear-gradient(180deg,#f7f5f0_0%,#f2ede2_100%)] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-6 lg:flex-row">
        <section className="flex-1 rounded-4xl border border-white/70 bg-white/90 p-6 shadow-xl backdrop-blur sm:p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/65">
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl font-bold leading-tight text-primary sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-inkd sm:text-base">{description}</p>
          <div className="mt-8">{children}</div>
        </section>

        {aside ? <aside className="w-full shrink-0 lg:w-100">{aside}</aside> : null}
      </div>
    </main>
  );
}

export function AssessmentOverviewCard({
  assessment,
}: {
  assessment: AssessmentCatalogItem;
}) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-[#16352A] p-6 text-white shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
        Assessment Snapshot
      </p>
      <div className="mt-5 space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <Clock3 className="h-5 w-5 text-[#95D5B2]" />
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-white/60">Starts</p>
          <p className="mt-1 text-sm font-semibold">{formatStartDate(assessment.starts_at)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <Users className="h-5 w-5 text-[#95D5B2]" />
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-white/60">Questions</p>
          <p className="mt-1 text-sm font-semibold">{assessment.question_count} items</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <UserRound className="h-5 w-5 text-[#95D5B2]" />
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-white/60">Identity</p>
          <p className="mt-1 text-sm font-semibold">
            {getParticipantIdentityLabel(assessment.participant_identity)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FlowStepper({
  steps,
  activeStep,
}: {
  steps: string[];
  activeStep: number;
}) {
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
}: {
  option: QuestionOption;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition ${
        selected
          ? "border-primary bg-[#D8F3DC] text-primary shadow-sm"
          : "border-border bg-white text-primary hover:border-primary/40"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
        {option.label}
      </span>
      <span className="text-sm font-medium leading-6">{option.text}</span>
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
      className={`rounded-2xl border border-border bg-white ring-1 ring-border/70 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-[#D8F3DC] p-3 text-primary">
          <Clock3 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
            Time limit
          </p>
          <p className="mt-2 text-lg font-bold text-primary">
            {minutes} minute{minutes === 1 ? "" : "s"}
          </p>
          <p className="mt-1 text-sm leading-6 text-inkd">
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
            Share the score summary together with the participant&apos;s answer response and the
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
            <button
              key={destination.name}
              type="button"
              className="group rounded-[24px] border border-border bg-muted/15 p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-white hover:shadow-sm"
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
            </button>
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
