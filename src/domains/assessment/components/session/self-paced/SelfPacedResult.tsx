import type { QuestionRendererValue } from "../../renderers/types";
import { ShareAnswerSheetPanel } from "../SessionShared";
import type { QuestionRound } from "../session.types";
import { getAnswerResponseText, isCorrectAnswerResponse } from "../session.utils";

export function SelfPacedResult({
  resultMode,
  scoreSummary,
  allowShareAnswerSheet,
  showCorrectAnswers,
  items,
  answerSheetTitle,
  answerSheetHeading,
}: {
  resultMode: "immediate" | "manual" | "hidden";
  scoreSummary: {
    earnedPoints: number;
    totalPoints: number;
    grade: string;
    passed: boolean;
  };
  allowShareAnswerSheet: boolean;
  showCorrectAnswers: boolean;
  items: { question: QuestionRound; answerValue: QuestionRendererValue }[];
  answerSheetTitle: string;
  answerSheetHeading: string;
}) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(24rem,0.9fr)]">
        <div className="rt-card-pop rounded-4xl border border-[#1C5C45]/20 bg-[radial-gradient(circle_at_top,rgba(249,199,79,0.28),transparent_30%),linear-gradient(180deg,#16352A_0%,#1E4738_55%,#245C47_100%)] p-6 text-white shadow-[0_24px_60px_rgba(22,53,42,0.22)] lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Result</p>
          {resultMode === "immediate" ? (
            <>
              <h2 className="mt-3 text-3xl font-bold">Results available now</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
                Review the score summary first, then open the answer sheet to compare your answer
                response with the correct answer for each question.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">Score</p>
                  <p className="mt-2 text-2xl font-bold">
                    {scoreSummary.earnedPoints}/{scoreSummary.totalPoints}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">Grade</p>
                  <p className="mt-2 text-2xl font-bold">{scoreSummary.grade}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">Status</p>
                  <p className="mt-2 text-2xl font-bold">{scoreSummary.passed ? "Pass" : "Fail"}</p>
                </div>
              </div>
            </>
          ) : null}

          {resultMode === "manual" ? (
            <>
              <h2 className="mt-3 text-3xl font-bold">Results will be released later</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
                The assessment is submitted successfully. Scores stay hidden until the creator
                releases them manually.
              </p>
            </>
          ) : null}

          {resultMode === "hidden" ? (
            <>
              <h2 className="mt-3 text-3xl font-bold">Submission received</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
                Responses were captured, but no score or grading breakdown is shown to the participant.
              </p>
            </>
          ) : null}
        </div>

        {resultMode === "immediate" ? (
          <ShareAnswerSheetPanel enabled={allowShareAnswerSheet} />
        ) : null}
      </div>

      {resultMode !== "hidden" ? (
        <div className="rounded-4xl border border-border bg-white/90 p-6 shadow-sm backdrop-blur lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                {answerSheetTitle}
              </p>
              <h3 className="mt-2 text-2xl font-bold text-primary">{answerSheetHeading}</h3>
            </div>
            <div className="rounded-full bg-muted/20 px-4 py-2 text-sm font-semibold text-primary">
              {items.length} questions
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {items.map(({ question, answerValue }, index) => {
              const isCorrect = isCorrectAnswerResponse(question, answerValue);
              const answerTone = isCorrect ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50";

              return (
                <div key={question.id} className={`rounded-[28px] border p-5 ${answerTone}`}>
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="pt-1 text-sm font-semibold text-primary">{question.question}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                        isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                    Your answer response
                  </p>
                  <p className="mt-1 text-sm leading-6 text-inkd">
                    {getAnswerResponseText(question, answerValue)}
                  </p>
                  {resultMode === "immediate" && showCorrectAnswers ? (
                    <>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                        Correct answer
                      </p>
                      <p className="mt-1 text-sm leading-6 text-inkd">
                        {question.options.find((option) => option.id === question.correctOptionId)?.text}
                      </p>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
