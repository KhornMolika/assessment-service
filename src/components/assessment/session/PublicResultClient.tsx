"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Award } from "lucide-react";
import type { AssessmentResultSheetPageData } from "@/src/types/assessment-results.types";

export function PublicResultClient({ data }: { data: AssessmentResultSheetPageData }) {
  const router = useRouter();

  useEffect(() => {
    const hasPending = data.answerEntries.some((e) => e.gradingStatus === "PENDING");
    if (!hasPending) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [data.answerEntries, router]);

  const scoreSummary = useMemo(() => {
    return {
      earnedPoints: data.answerSheet.totalScore ?? 0,
      totalPoints: data.answerSheet.maxScore ?? 0,
      grade: data.answerSheet.grade ?? "N/A",
      passed: data.answerSheet.isPassed ?? false,
      status: data.answerSheet.status,
    };
  }, [data]);

  const percentage =
    scoreSummary.totalPoints > 0
      ? Math.round((scoreSummary.earnedPoints / scoreSummary.totalPoints) * 100)
      : 0;

  const isPending = scoreSummary.status === "REVIEW_PENDING" || scoreSummary.status === "IN_PROGRESS" || scoreSummary.status === "SUBMITTED";

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[linear-gradient(135deg,#fdfdfd_0%,#f4f9f7_50%,#ebf5f2_100%)] p-4 sm:p-8">
      <div className="w-full max-w-3xl overflow-hidden rounded-[2.5rem] border border-white/50 bg-white/40 p-2 shadow-[0_32px_64px_rgba(20,53,43,0.08)] backdrop-blur-3xl sm:p-3">
        <div className="relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-sm sm:p-12">
          {/* Background decorative elements */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#10a37f]/5 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Header Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-inkd">
              <Award className="h-4 w-4 text-primary" />
              Assessment Result
            </div>

            {/* Assessment Title */}
            <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-primary sm:text-5xl lg:text-6xl">
              {data.assessment.name || "Untitled Assessment"}
            </h1>
            
            {/* Participant Name */}
            <p className="mt-4 text-lg font-medium text-inkd sm:text-xl">
              Completed by <span className="font-bold text-primary">{data.participant.display_name}</span>
            </p>

            <div className="my-10 h-px w-full max-w-md bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Main Score Area */}
            {isPending ? (
              <div className="flex flex-col items-center justify-center space-y-4 rounded-3xl border border-orange-200 bg-orange-50/50 p-8 sm:p-12 w-full max-w-lg">
                <div className="relative flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-white shadow-sm border border-orange-100">
                   <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-primary">Pending Manual Review</h3>
                <p className="text-center text-inkd">
                  The host must manually grade some answers before the final score is available. Please check back later.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-8">
                {/* Score Ring */}
                <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-white shadow-[0_8px_32px_rgba(20,53,43,0.06)] ring-1 ring-border/50 sm:h-56 sm:w-56">
                  {/* SVG Circle for progress */}
                  <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="stroke-muted/30"
                      strokeWidth="6"
                      cx="50"
                      cy="50"
                      r="44"
                      fill="transparent"
                    />
                    <circle
                      className={`transition-all duration-1000 ease-out ${
                        scoreSummary.passed ? "stroke-[#10a37f]" : "stroke-rose-500"
                      }`}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray="276"
                      strokeDashoffset={276 - (276 * percentage) / 100}
                      cx="50"
                      cy="50"
                      r="44"
                      fill="transparent"
                    />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-5xl font-black tracking-tighter text-primary sm:text-6xl">
                      {scoreSummary.earnedPoints}
                    </span>
                    <span className="mt-1 text-sm font-medium uppercase tracking-[0.1em] text-inkd">
                      / {scoreSummary.totalPoints} pts
                    </span>
                  </div>
                </div>

                {/* Grade & Pass/Fail */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <div className={`inline-flex items-center gap-2 rounded-2xl border px-6 py-3 text-lg font-bold shadow-sm ${
                    scoreSummary.passed 
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800" 
                      : "border-rose-200 bg-rose-50 text-rose-800"
                  }`}>
                    {scoreSummary.passed ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-rose-600" />
                    )}
                    {scoreSummary.passed ? "Passed" : "Failed"}
                  </div>

                  {scoreSummary.grade && scoreSummary.grade !== "N/A" && (
                    <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white px-6 py-3 text-lg font-bold text-primary shadow-sm">
                      Grade: {scoreSummary.grade}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
