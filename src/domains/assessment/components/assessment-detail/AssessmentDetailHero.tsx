import Link from "next/link";
import { ArrowLeft, Award, FileText, TrendingUp, Users } from "lucide-react";
import type { AssessmentDetailRecord } from "@/src/domains/assessment/types/assessment-detail.types";

function getStatusTone(status: AssessmentDetailRecord["lifecycle"]) {
  switch (status) {
    case "ACTIVE":
      return "border-[#74C69D]/40 bg-[#74C69D]/20 text-[#74C69D]";
    case "DRAFT":
      return "border-white/40 bg-white/20 text-white";
    case "COMPLETED":
      return "border-white/40 bg-white/20 text-white";
    case "PENDING":
      return "border-[#F4A261]/40 bg-[#F4A261]/15 text-[#FFE8D6]";
    case "EXAM":
      return "border-[#90E0EF]/40 bg-[#90E0EF]/15 text-[#CAF0F8]";
    default:
      return "border-white/40 bg-white/20 text-white";
  }
}

function formatLifecycle(value: AssessmentDetailRecord["lifecycle"]) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function formatDeliveryMode(value: AssessmentDetailRecord["delivery_mode"]) {
  return value === "SELF_PACED" ? "Self-paced" : "Real-time";
}

type SummaryCard = {
  key:
    | "question_count"
    | "participant_count"
    | "average_score_percent"
    | "pass_rate_percent";
  label: string;
  icon: typeof FileText;
  suffix?: string;
};

const summaryCards: readonly SummaryCard[] = [
  { key: "question_count", label: "Questions", icon: FileText },
  { key: "participant_count", label: "Participants", icon: Users },
  { key: "average_score_percent", label: "Avg Score", icon: Award, suffix: "%" },
  { key: "pass_rate_percent", label: "Pass Rate", icon: TrendingUp, suffix: "%" },
];

export default function AssessmentDetailHero({
  assessment,
}: {
  assessment: AssessmentDetailRecord;
}) {
  return (
    <section className="bg-linear-to-br from-[#2D6A4F] via-[#2D6A4F] to-[#40916C] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/assessments"
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assessments
        </Link>

        <div className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${getStatusTone(assessment.lifecycle)}`}
            >
              {formatLifecycle(assessment.lifecycle)}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
              {formatDeliveryMode(assessment.delivery_mode)}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">{assessment.title}</h1>
          <p className="mt-2 max-w-3xl text-base text-white/70 sm:text-lg">{assessment.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map(({ key, label, icon: Icon, suffix }) => (
            <div
              key={key}
              className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {assessment[key]}
                    {suffix ?? ""}
                  </div>
                  <div className="text-xs text-white/60">{label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
