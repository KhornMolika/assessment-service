"use client";

import { useMemo } from "react";
import { Users } from "lucide-react";
import type { AssessmentScopedResultsPageData } from "@/src/types/assessment-results.types";
import { BackButton } from "@/src/components/ui/navigation/BackButton";
import { Badge } from "@/src/components/ui/ui/badge";
import { ResultsTable } from "../results/ResultsTable";
import { buildRows } from "../results/results.utils";

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
        answerSheets: data.answerSheets,
        answerEntries: data.answerEntries,
        questions: data.questions,
        topics: [],
        assessmentTopics: [],
      }),
    [data],
  );

  return (
    <div>
      <div className="w-full space-y-6">
        <BackButton
          href={`/assessments/${data.assessment.id}`}
          label="Back to assessment"
          className="px-0 py-0 text-sm font-medium"
        />

        <div className="rounded-[28px] border border-border/70 bg-white/95 p-4 shadow-[0_18px_44px_rgba(20,53,43,0.08)] sm:p-6">
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

          <ResultsTable
            rows={rows}
            detailBackHref={`/assessments/${data.assessment.id}/reports`}
          />
        </div>
      </div>
    </div>
  );
}
