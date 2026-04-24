"use client";

import { useMemo } from "react";
import { FileWarning, Users } from "lucide-react";
import type { AssessmentScopedResultsPageData } from "@/src/domains/assessment/types/assessment-results.types";
import { BackButton } from "@/src/shared/components/navigation/BackButton";
import { Badge } from "@/src/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/shared/components/ui/card";
import { ResultsStats } from "../results/ResultsStats";
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

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px] lg:max-w-[420px]">
          <div className="rounded-2xl border border-border/70 bg-white/85 px-4 py-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-inkd/80">
              Delivery
            </div>
            <div className="mt-2 text-base font-semibold text-primary">
              {data.assessment.delivery_mode === "REAL_TIME" ? "Real-time" : "Self-paced"}
            </div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-white/85 px-4 py-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-inkd/80">
              Status
            </div>
            <div className="mt-2 text-base font-semibold text-primary">{data.assessment.status}</div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-white/85 px-4 py-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-inkd/80">
              Participants
            </div>
            <div className="mt-2 text-base font-semibold text-primary">{data.stats.totalParticipants}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssessmentReportSummary({
  data,
}: {
  data: AssessmentScopedResultsPageData;
}) {
  const pendingEntries = data.answer_entries.filter((entry) => entry.grading_status === "PENDING");

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="border-border/70 bg-white/95 shadow-[0_18px_44px_rgba(20,53,43,0.08)]">
        <CardHeader>
          <CardTitle className="text-lg">Report Scope</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-inkd/80">
              Question count
            </div>
            <div className="mt-2 text-2xl font-bold text-primary">{data.questions.length}</div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-inkd/80">
              Answer sheets
            </div>
            <div className="mt-2 text-2xl font-bold text-primary">{data.answer_sheets.length}</div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-inkd/80">
              Answer entries
            </div>
            <div className="mt-2 text-2xl font-bold text-primary">{data.answer_entries.length}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-white/95 shadow-[0_18px_44px_rgba(20,53,43,0.08)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileWarning className="h-4 w-4" />
            Manual Review
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-800/80">
              Pending sheets
            </div>
            <div className="mt-2 text-3xl font-bold text-primary">{data.stats.pendingReviewCount}</div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/35 px-4 py-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-inkd/80">
              Pending answer entries
            </div>
            <div className="mt-2 text-lg font-semibold text-primary">{pendingEntries.length}</div>
          </div>
          <div className="text-sm text-inkd">
            Open a participant result to review essay, short-answer, and file-upload responses that are still pending.
          </div>
        </CardContent>
      </Card>
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#F7FAF8_0%,#FFFFFF_28%,#F4FAF6_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <AssessmentReportHeader data={data} />

        <div className="mt-6">
          <ResultsStats stats={data.stats} />
        </div>

        <div className="mt-6">
          <AssessmentReportSummary data={data} />
        </div>

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
