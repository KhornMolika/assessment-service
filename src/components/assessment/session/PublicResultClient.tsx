"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AssessmentResultSheetPageData } from "@/src/types/assessment-results.types";
import type { AnswerEntry } from "@/src/types/answer-entry.types";
import { SelfPacedResult } from "./self-paced/SelfPacedResult";
import type { QuestionRound } from "@/src/types/session.types";
import { ScreenShell } from "./SessionShared";

function parseResponseValue(entry: AnswerEntry) {
  if (typeof entry.response === "string") {
    try {
      const parsed = JSON.parse(entry.response);
      if (typeof parsed === "number" && entry.questionSnapshot.typeId === "SINGLE_CHOICE") {
        return String(parsed);
      }
      return parsed;
    } catch {
      return entry.response;
    }
  }
  return entry.response;
}

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const totalPoints = data.assessment.settings?.passMark || 0; // The actual UI computes this from rounds. Let's just use what's on the sheet.
    return {
      earnedPoints: data.answerSheet.totalScore ?? 0,
      totalPoints: data.answerSheet.maxScore ?? 0,
      grade: data.answerSheet.grade ?? "N/A",
      passed: data.answerSheet.isPassed ?? false,
    };
  }, [data]);

  const items = useMemo(() => {
    return data.answerEntries.map((entry) => {
      const question: QuestionRound = {
        id: entry.questionId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: entry.questionSnapshot.typeId as any,
        question: entry.questionSnapshot.questionText,
        options: Array.isArray(entry.questionSnapshot.options) ? entry.questionSnapshot.options : [],
        rawOptions: entry.questionSnapshot.options,
        correctAnswers: entry.questionSnapshot.correctAnswers,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        correctOptionId: (entry.questionSnapshot.correctAnswers as any)?.optionId,
        points: entry.questionSnapshot.points,
      } as unknown as QuestionRound;

      return {
        question,
        answerValue: parseResponseValue(entry),
      };
    });
  }, [data]);

  const resultMode = data.assessment.settings?.showResults === "AFTER_SUBMISSION" ? "immediate" : "manual";

  return (
    <ScreenShell
      eyebrow="Public Result"
      title={data.assessment.name || "Assessment"}
      description={data.assessment.description!}
      aside={null}
    >
      <div className="flex flex-1 min-h-0 flex-col">
        <SelfPacedResult
          resultMode={resultMode}
          scoreSummary={scoreSummary}
          allowShareAnswerSheet={false} // Don't allow sharing from the shared page itself
          showCorrectAnswers={data.assessment.settings?.allowReview ?? false}
          items={items}
          answerSheetTitle="Answer sheet"
          answerSheetHeading="Review every answer response"
        />
      </div>
    </ScreenShell>
  );
}
