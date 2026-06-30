import type { QuestionRendererValue } from "../../renderers/types";
import { ShareAnswerSheetPanel } from "../SessionShared";
import type { QuestionRound } from '@/src/types/session.types';
import { getAnswerResponseText, isCorrectAnswerResponse, isSubjectiveQuestion, getCorrectAnswerText, normalizeQuestionRendererType, calculateQuestionScore } from '@/src/lib/session/session.utils';
import { Check, X, Minus } from "lucide-react";

function AnswerFeedbackRenderer({ question, value }: { question: QuestionRound; value: QuestionRendererValue }) {
  const type = normalizeQuestionRendererType(question.type);

  if (type === "fill") {
    const acceptedAnswers = question.correctAnswers?.answers || [];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {acceptedAnswers.map((accepted: any, index: number) => {
            const given = String((value as Record<string, string>)[index] || "").trim();
            const isMatch = Array.isArray(accepted) && accepted.some((a: string) => a.trim().toLowerCase() === given.toLowerCase());
            
            return (
              <div key={index} className={`px-3 py-2 rounded-lg text-sm font-medium ${isMatch ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                <span className="opacity-50 mr-2 text-xs">Blank {index + 1}:</span>
                {given || <span className="italic opacity-50">Empty</span>}
              </div>
            );
          })}
        </div>
      );
    }
  }

  if (type === "matching") {
    const pairs = question.correctAnswers?.pairs || [];
    const raw = question.rawOptions;
    if (typeof value === "object" && value !== null && !Array.isArray(value) && Array.isArray(pairs)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const correctMap = new Map(pairs.map((p: any) => [p.leftId, p.rightId]));
      const leftOptions = raw?.leftSide || [];
      const rightOptions = raw?.rightSide || [];

      return (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {leftOptions.map((leftOpt: any) => {
            const givenRightId = (value as Record<string, string>)[leftOpt.id];
            const isMatch = correctMap.get(leftOpt.id) === givenRightId;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const givenRightOpt = rightOptions.find((o: any) => o.id === givenRightId);

            return (
              <div key={leftOpt.id} className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${isMatch ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                <span className="truncate flex-1 pr-4">{leftOpt.text}</span>
                <span className="opacity-50 mx-2">→</span>
                <span className="truncate flex-1 pl-4 text-right">{givenRightOpt ? givenRightOpt.text : <span className="italic opacity-50">No match</span>}</span>
              </div>
            );
          })}
        </div>
      );
    }
  }

  if (type === "multiple") {
    if (Array.isArray(value)) {
      const correctIds = question.correctAnswers?.optionIds || [question.correctOptionId];
      
      return (
        <div className="flex flex-col gap-2">
          {value.map((id: string) => {
            const isMatch = correctIds.includes(id);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const opt = question.options.find((o: any) => o.id === id);
            
            return (
              <div key={id} className={`px-3 py-2 rounded-lg text-sm font-medium ${isMatch ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                {opt ? `${opt.label}. ${opt.text}` : id}
              </div>
            );
          })}
          {value.length === 0 && <span className="italic opacity-50 text-primary/70">No answer provided</span>}
        </div>
      );
    }
  }

  // Fallback to basic text renderer
  const text = getAnswerResponseText(question, value);
  return <div className="text-base font-medium">{text ? text : <span className="italic opacity-50">No answer provided</span>}</div>;
}

export function SelfPacedResult({
  resultMode,
  scoreSummary,
  allowShareAnswerSheet,
  showCorrectAnswers,
  items,
  answerSheetTitle,
  answerSheetHeading,
  shareUrl = "",
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
  items: { question: QuestionRound; answerValue: QuestionRendererValue; serverScore?: number | null; gradingStatus?: string }[];
  answerSheetTitle: string;
  answerSheetHeading: string;
  shareUrl?: string;
}) {
  const showSharePanel = allowShareAnswerSheet && resultMode === "immediate";

  return (
    <div className="flex w-full flex-col space-y-10 pb-12">
      {/* Minimal Header */}
      <div className="border-b border-border/50 pb-8">
        <div className="flex flex-col gap-8">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center rounded-full bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary/60">
              {resultMode === "immediate" ? "Results" : "Submitted"}
            </div>

            {resultMode === "immediate" ? (
              <div>
                <h2 className="text-4xl font-bold tracking-tight text-primary">Your score is {scoreSummary.earnedPoints}/{scoreSummary.totalPoints}</h2>
                <p className="mt-3 max-w-2xl text-base text-primary/60">
                  Review your detailed performance below. 
                  {scoreSummary.grade !== "N/A" ? (
                    <> You received a grade of <strong className="text-primary">{scoreSummary.grade}</strong> ({scoreSummary.passed ? "Passed" : "Failed"}).</>
                  ) : (
                    <> You <strong className="text-primary">{scoreSummary.passed ? "Passed" : "Failed"}</strong>.</>
                  )}
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-4xl font-bold tracking-tight text-primary">Assessment Submitted</h2>
                <p className="mt-3 max-w-2xl text-base text-primary/60">
                  {resultMode === "manual" 
                    ? "Your responses were submitted successfully. Scores remain hidden until released."
                    : "Your responses were captured successfully."}
                </p>
              </div>
            )}
          </div>

          {showSharePanel ? (
            <div className="w-full">
              <ShareAnswerSheetPanel
                enabled={true}
                title={answerSheetTitle}
                description="Share your score and answer sheet."
                shareUrl={shareUrl}
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Clean Answer Sheet List */}
      {resultMode !== "hidden" ? (
        <div>
          <h3 className="text-xl font-bold text-primary mb-8">{answerSheetHeading}</h3>
          
          <div className="grid gap-10">
            {items.map(({ question, answerValue, serverScore, gradingStatus }, index) => {
              const isSubjective = isSubjectiveQuestion(question.type);
              const isPending = isSubjective && gradingStatus === "PENDING";
              const questionScore = typeof serverScore === "number" ? serverScore : calculateQuestionScore(question, answerValue);
              
              const isPerfect = questionScore === (question.points || 0) && (question.points || 0) > 0;
              const isPartial = questionScore > 0 && questionScore < (question.points || 0);

              return (
                <div key={index} className="flex gap-4">
                  <div className="shrink-0 pt-1">
                    {isPending ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Minus className="h-4 w-4" />
                      </div>
                    ) : isPerfect ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <Check className="h-4 w-4" />
                      </div>
                    ) : isPartial ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-500" title="Partial Credit">
                        <Minus className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                        <X className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-5">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <p className="text-lg font-semibold leading-relaxed text-primary">{question.question}</p>
                        <div className="shrink-0 text-right mt-1">
                          <span className="text-sm font-bold text-primary/60">
                            {isPending ? '—' : questionScore} / {question.points} pts
                          </span>
                        </div>
                      </div>
                      {normalizeQuestionRendererType(question.type) === "fill" && question.rawOptions?.template ? (
                        <p className="mt-2 text-base font-medium leading-relaxed text-primary/70">{question.rawOptions.template}</p>
                      ) : null}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-primary/40">Your Answer</p>
                        <div className={isSubjective ? 'text-primary/70' : ''}>
                          <AnswerFeedbackRenderer question={question} value={answerValue} />
                        </div>
                      </div>

                      {!isSubjective && resultMode === "immediate" && showCorrectAnswers && !isCorrect ? (
                        <div>
                          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-primary/40">Correct Answer</p>
                          <div className="text-base font-medium text-emerald-700">
                            {getCorrectAnswerText(question)}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="py-12 text-center text-sm font-medium text-primary/40">
            End of answer sheet
          </div>
        </div>
      ) : null}
    </div>
  );
}
