"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import type { AssessmentScopedResultsPageData } from "@/src/types/assessment-results.types";
import { BackButton } from "@/src/components/ui/navigation/BackButton";
import { Badge } from "@/src/components/ui/ui/badge";
import { ResultsTable } from "../results/ResultsTable";
import { buildRows } from "../results/results.utils";
import type { ResultsRow } from "../results/results.types";

const RESULT_ROW_UPDATE_PREFIX = "assessment-result-row-update:";

export default function AssessmentScopedResultsView({
  data,
}: {
  data: AssessmentScopedResultsPageData;
}) {
  const router = useRouter();
  const builtRows = useMemo(
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
  const [rows, setRows] = useState<ResultsRow[]>(builtRows);

  const applyPendingRowUpdates = useCallback(() => {
    const pendingUpdates = builtRows
      .map((row) => {
        const raw = sessionStorage.getItem(`${RESULT_ROW_UPDATE_PREFIX}${row.sheetId}`);
        if (!raw) return null;

        try {
          return JSON.parse(raw) as {
            sheetId: string;
            totalScore: number | null;
            maxScore: number;
            grade: string | null;
            isPassed: boolean | null;
            status: ResultsRow["answerSheetStatus"];
          };
        } catch {
          sessionStorage.removeItem(`${RESULT_ROW_UPDATE_PREFIX}${row.sheetId}`);
          return null;
        }
      })
      .filter((update): update is NonNullable<typeof update> => update !== null);

    if (pendingUpdates.length === 0) return;

    setRows((currentRows) =>
      currentRows.map((row) => {
        const update = pendingUpdates.find((item) => item.sheetId === row.sheetId);
        if (!update) return row;

        const percentage =
          update.totalScore != null && update.maxScore > 0
            ? Math.round((update.totalScore / update.maxScore) * 100)
            : null;
        const evaluationStatus =
          update.status === "REVIEW_PENDING" ? "PENDING_REVIEW" : "FINAL";

        return {
          ...row,
          answerSheetStatus: update.status,
          totalScore: update.totalScore,
          maxScore: update.maxScore,
          percentage,
          grade: update.grade,
          outcomeStatus:
            evaluationStatus === "PENDING_REVIEW"
              ? "PENDING_REVIEW"
              : update.isPassed
                ? "PASSED"
                : "FAILED",
          evaluationStatus,
        };
      }),
    );
  }, [builtRows]);

  useEffect(() => {
    setRows(builtRows);
  }, [builtRows]);

  useEffect(() => {
    applyPendingRowUpdates();

    function handleRowUpdate() {
      applyPendingRowUpdates();
    }

    function handlePageShow() {
      if (document.visibilityState === "hidden") return;
      router.refresh();
      applyPendingRowUpdates();
    }

    window.addEventListener("assessment-result-row-updated", handleRowUpdate);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handlePageShow);

    return () => {
      window.removeEventListener("assessment-result-row-updated", handleRowUpdate);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handlePageShow);
    };
  }, [applyPendingRowUpdates, router]);

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
