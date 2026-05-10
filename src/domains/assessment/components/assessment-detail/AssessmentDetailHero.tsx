import type { AssessmentDetailRecord } from "@/src/domains/assessment/types/assessment-detail.types";
import { PageHeaderCard } from "@/src/shared/components/layout/PageHeaderCard";

function getStatusTone(status: AssessmentDetailRecord["lifecycle"]) {
  switch (status) {
    case "ACTIVE":
      return "border-[#74C69D]/40 bg-[#74C69D]/20 text-[#74C69D]";
    case "DRAFT":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "COMPLETED":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "PENDING":
      return "border-[#F4A261]/40 bg-[#F4A261]/15 text-[#A85A14]";
    case "EXAM":
      return "border-[#90E0EF]/40 bg-[#90E0EF]/15 text-[#0C7184]";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function formatLifecycle(value: AssessmentDetailRecord["lifecycle"]) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function formatDeliveryMode(value: AssessmentDetailRecord["delivery_mode"]) {
  return value === "SELF_PACED" ? "Self-paced" : "Real-time";
}

export default function AssessmentDetailHero({
  assessment,
}: {
  assessment: AssessmentDetailRecord;
}) {
  return (
    <section className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <PageHeaderCard
          backHref="/assessments"
          backLabel="Back to Assessments"
          title={assessment.title}
          description={assessment.subtitle}
          meta={
            <>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${getStatusTone(assessment.lifecycle)}`}
              >
                {formatLifecycle(assessment.lifecycle)}
              </span>
              <span className="rounded-full border border-border/70 bg-white px-3 py-1 text-xs font-semibold text-primary/75">
                {formatDeliveryMode(assessment.delivery_mode)}
              </span>
            </>
          }
        />
      </div>
    </section>
  );
}
