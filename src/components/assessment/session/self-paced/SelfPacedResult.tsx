import type { QuestionRendererValue } from "../../renderers/types";
import { ShareAnswerSheetPanel } from "../SessionShared";
import type { QuestionRound } from '@/src/types/session.types';
import { getAnswerResponseText, isCorrectAnswerResponse } from '@/src/lib/session/session.utils';

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
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,auto)]">
        {/* Modern Result Header */}
        <div className="relative overflow-hidden rounded-[32px] border border-border/60 bg-white/80 p-8 shadow-2xl shadow-primary/5 backdrop-blur-xl sm:p-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent pointer-events-none" />
          
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary mb-4">
              Result
            </div>

            {resultMode === "immediate" ? (
              <>
                <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Results available now</h2>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-primary/70">
                  Review your score summary below, then scroll down to compare your responses with the correct answers.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-white px-5 py-4 shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary/50">Score</span>
                      <span className="text-2xl font-black text-primary">{scoreSummary.earnedPoints}<span className="text-primary/40 text-xl">/{scoreSummary.totalPoints}</span></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-white px-5 py-4 shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary/50">Grade</span>
                      <span className="text-2xl font-black text-primary">{scoreSummary.grade}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-white px-5 py-4 shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary/50">Status</span>
                      <span className={`text-2xl font-black ${scoreSummary.passed ? "text-emerald-600" : "text-rose-600"}`}>
                        {scoreSummary.passed ? "Pass" : "Fail"}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {resultMode === "manual" ? (
              <>
                <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Submission received</h2>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-primary/70">
                  Your assessment was submitted successfully. Scores remain hidden until the creator releases them.
                </p>
              </>
            ) : null}

            {resultMode === "hidden" ? (
              <>
                <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Submission received</h2>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-primary/70">
                  Your responses were captured successfully. No score or grading breakdown is available for this assessment.
                </p>
              </>
            ) : null}
          </div>
        </div>

        {resultMode === "immediate" ? (
          <ShareAnswerSheetPanel enabled={allowShareAnswerSheet} />
        ) : null}
      </div>

      {resultMode !== "hidden" ? (
        <div className="overflow-hidden rounded-[32px] border border-border/60 bg-white/70 shadow-xl shadow-primary/5 backdrop-blur-xl">
          <div className="border-b border-border/50 bg-white/50 px-8 py-6 sm:px-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary/50 mb-1">
                  {answerSheetTitle}
                </p>
                <h3 className="text-2xl font-bold text-primary">{answerSheetHeading}</h3>
              </div>
              <div className="rounded-full bg-primary/5 px-4 py-2 text-sm font-bold text-primary">
                {items.length} questions
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <div className="grid gap-6">
              {items.map(({ question, answerValue }, index) => {
                const isCorrect = isCorrectAnswerResponse(question, answerValue);
                
                return (
                  <div key={question.id} className={`relative overflow-hidden rounded-[28px] border-2 bg-white p-6 sm:p-8 transition-all ${
                    isCorrect 
                      ? "border-emerald-200/60 shadow-sm shadow-emerald-500/5 hover:border-emerald-300" 
                      : "border-rose-200/60 shadow-sm shadow-rose-500/5 hover:border-rose-300"
                  }`}>
                    {/* Background Tint */}
                    <div className={`absolute inset-0 opacity-40 pointer-events-none ${
                      isCorrect ? "bg-gradient-to-br from-emerald-50 to-transparent" : "bg-gradient-to-br from-rose-50 to-transparent"
                    }`} />
                    
                    <div className="relative">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white shadow-sm ${
                            isCorrect ? "bg-emerald-500 shadow-emerald-500/20" : "bg-rose-500 shadow-rose-500/20"
                          }`}>
                            {index + 1}
                          </span>
                          <p className="pt-1 text-lg font-semibold leading-relaxed text-primary">{question.question}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                          isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}>
                          {isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      </div>

                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className={`rounded-2xl border p-5 ${
                          isCorrect ? "border-emerald-200/50 bg-emerald-50/50" : "border-rose-200/50 bg-rose-50/50"
                        }`}>
                          <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                            isCorrect ? "text-emerald-700/60" : "text-rose-700/60"
                          }`}>
                            Your answer
                          </p>
                          <p className="text-base font-medium leading-relaxed text-primary">
                            {getAnswerResponseText(question, answerValue) || <span className="italic opacity-50">No answer provided</span>}
                          </p>
                        </div>

                        {resultMode === "immediate" && showCorrectAnswers && !isCorrect ? (
                          <div className="rounded-2xl border border-emerald-200/50 bg-emerald-50/50 p-5">
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700/60 mb-2">
                              Correct answer
                            </p>
                            <p className="text-base font-medium leading-relaxed text-emerald-900">
                              {question.options.find((option: any) => option.id === question.correctOptionId)?.text}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
