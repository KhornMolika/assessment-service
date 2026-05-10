"use client";

import { useMemo } from "react";
import { Users } from "lucide-react";
import type { AssessmentScopedResultsPageData } from "@/src/domains/assessment/types/assessment-results.types";
import { BackButton } from "@/src/shared/components/navigation/BackButton";
import { Badge } from "@/src/shared/components/ui/badge";
import { ResultsTable } from "../results/ResultsTable";
import { buildRows } from "../results/results.utils";

function AssessmentReportHeader({
  data,
}: {
  data: AssessmentScopedResultsPageData;
}) {
  return (
    <div className="rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(241,249,245,0.96)_45%,rgba(231,245,242,0.92)_100%)] p-6 shadow-[0_20px_48px_rgba(20,53,43,0.08)] sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <BackButton
            href={`/assessments/${data.assessment.id}`}
            label="Back to assessment"
            className="px-0 py-0 text-sm font-medium"
          />
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-inkd/80">
              Assessment Results
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              {data.assessment.title}
            </h1>
            {data.assessment.description ? (
              <p className="mt-3 max-w-3xl text-sm leading-7 text-inkd sm:text-base">
                {data.assessment.description}
              </p>
            ) : null}
          </div>
        </div>

        <Badge variant="secondary">
          {data.assessment.delivery_mode === "REAL_TIME" ? "Real-time" : "Self-paced"}
        </Badge>
      </div>
    </div>
  );
}

export default function AssessmentScopedResultsView({
  data,
}: {
  data: AssessmentScopedResultsPageData;
}) {
  const rows = useMemo(
    () =>
      buildRows({
        stats: data.stats,
        assessments: [data.assessment],
        participants: data.participants,
        answer_sheets: data.answer_sheets,
        answer_entries: data.answer_entries,
        questions: data.questions,
        topics: [],
        assessment_topics: [],
      }),
    [data],
  );

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <AssessmentReportHeader data={data} />

        <div className="mt-6 rounded-[28px] border border-border/70 bg-white/95 p-4 shadow-[0_18px_44px_rgba(20,53,43,0.08)] sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-primary">Participant Results</h2>
              <p className="mt-1 text-sm text-inkd">
                Review all submitted answer sheets for this assessment. Open a row to inspect answers and complete manual grading.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/35 px-4 py-2 text-sm text-primary">
              <Users className="h-4 w-4" />
              {rows.length} submissions
            </div>
          </div>

          {data.stats.pendingReviewCount > 0 ? (
            <div className="mb-5">
              <Badge variant="pending">
                {data.stats.pendingReviewCount} submissions still need manual review
              </Badge>
            </div>
          ) : null}

          <ResultsTable rows={rows} />
        </div>
      </div>
    </div>
  );
}
