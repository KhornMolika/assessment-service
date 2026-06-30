import type { QuestionRendererValue } from "../../renderers/types";
import { ShareAnswerSheetPanel } from "../SessionShared";
import type { QuestionRound } from '@/src/types/session.types';
import { getAnswerResponseText, isCorrectAnswerResponse, isSubjectiveQuestion, getCorrectAnswerText, normalizeQuestionRendererType, calculateQuestionScore } from '@/src/lib/session/session.utils';
import { Check, X, Minus, Target } from "lucide-react";
import { ShareModal } from "./ShareModal";
function AnswerFeedbackRenderer({ question, value }: { question: QuestionRound; value: QuestionRendererValue }) {
  const type = normalizeQuestionRendererType(question.type);

  if (type === "fill") {
    const acceptedAnswers = question.correctAnswers?.answers || [];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return (
        <div className="flex flex-col gap-2.5">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {acceptedAnswers.map((accepted: any, index: number) => {
            const given = String((value as Record<string, string>)[index] || "").trim();
            const isMatch = Array.isArray(accepted) && accepted.some((a: string) => a.trim().toLowerCase() === given.toLowerCase());
            
            return (
              <div key={index} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isMatch ? "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200/60" : "bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-200/60"}`}>
                <span className="shrink-0 rounded-md bg-white/60 px-2 py-0.5 text-xs font-bold uppercase tracking-wider opacity-70">Blank {index + 1}</span>
                <span className="flex-1">{given || <span className="italic opacity-50">Empty</span>}</span>
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
        <div className="flex flex-col gap-2.5">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {leftOptions.map((leftOpt: any) => {
            const givenRightId = (value as Record<string, string>)[leftOpt.id];
            const isMatch = correctMap.get(leftOpt.id) === givenRightId;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const givenRightOpt = rightOptions.find((o: any) => o.id === givenRightId);

            return (
              <div key={leftOpt.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isMatch ? "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200/60" : "bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-200/60"}`}>
                <span className="flex-1 truncate">{leftOpt.text}</span>
                <span className="shrink-0 text-emerald-600/50">→</span>
                <span className="flex-1 truncate text-right font-semibold">{givenRightOpt ? givenRightOpt.text : <span className="italic opacity-50 font-normal">No match</span>}</span>
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
        <div className="flex flex-col gap-2.5">
          {value.map((id: string) => {
            const isMatch = correctIds.includes(id);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const opt = question.options.find((o: any) => o.id === id);
            
            return (
              <div key={id} className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isMatch ? "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200/60" : "bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-200/60"}`}>
                {opt ? `${opt.label}. ${opt.text}` : id}
              </div>
            );
          })}
          {value.length === 0 && <div className="px-4 py-3 rounded-xl text-sm font-medium bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-200/60 italic">No answer provided</div>}
        </div>
      );
    }
  }

  // Fallback to basic text renderer
  const text = getAnswerResponseText(question, value);
  return (
    <div className="px-4 py-3 rounded-xl text-sm font-medium bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200/60 whitespace-pre-wrap">
      {text ? text : <span className="italic opacity-50">No answer provided</span>}
    </div>
  );
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
    <div className="flex w-full flex-col space-y-10 pb-16">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-8 shadow-[0_8px_32px_rgba(20,53,43,0.04)] backdrop-blur-xl sm:p-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        
        <div className="relative z-10 flex flex-col gap-8">
          <div className="min-w-0">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary shadow-sm">
                <Target className="h-3.5 w-3.5" />
                {resultMode === "immediate" ? "Assessment Results" : "Assessment Submitted"}
              </div>
              
              {showSharePanel && (
                <ShareModal 
                  title={answerSheetTitle} 
                  shareUrl={shareUrl} 
                />
              )}
            </div>

            {resultMode === "immediate" ? (
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
                    You scored {scoreSummary.earnedPoints} <span className="text-2xl text-primary/50 font-semibold">/ {scoreSummary.totalPoints} pts</span>
                  </h2>
                  <p className="mt-4 max-w-2xl text-lg text-primary/70">
                    {scoreSummary.grade !== "N/A" ? (
                      <>You received a grade of <strong className="text-primary">{scoreSummary.grade}</strong> ({scoreSummary.passed ? "Passed" : "Failed"}).</>
                    ) : (
                      <>You <strong className="text-primary">{scoreSummary.passed ? "Passed" : "Failed"}</strong> this assessment.</>
                    )}
                  </p>
                </div>
                
                <div className={`shrink-0 inline-flex items-center justify-center rounded-2xl px-8 py-4 text-xl font-bold border shadow-sm ${scoreSummary.passed ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"}`}>
                  {scoreSummary.passed ? (
                    <><Check className="h-6 w-6 mr-2" /> Passed</>
                  ) : (
                    <><X className="h-6 w-6 mr-2" /> Failed</>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">Responses Captured</h2>
                <p className="mt-4 max-w-2xl text-lg text-primary/70">
                  {resultMode === "manual" 
                    ? "Your responses were submitted successfully. Scores remain hidden until the host releases them."
                    : "Your assessment was submitted successfully."}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Answer Sheet List */}
      {resultMode !== "hidden" ? (
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-8 flex items-center justify-between px-2">
            <h3 className="text-2xl font-bold tracking-tight text-primary">{answerSheetHeading}</h3>
            <span className="text-sm font-semibold text-primary/40 uppercase tracking-widest">{items.length} Questions</span>
          </div>
          
          <div className="grid gap-6">
            {items.map(({ question, answerValue, serverScore, gradingStatus }, index) => {
              const isSubjective = isSubjectiveQuestion(question.type);
              const isPending = isSubjective && gradingStatus === "PENDING";
              const questionScore = typeof serverScore === "number" ? serverScore : calculateQuestionScore(question, answerValue);
              
              const isPerfect = questionScore === (question.points || 0) && (question.points || 0) > 0;
              const isPartial = questionScore > 0 && questionScore < (question.points || 0);
              const isCorrect = isCorrectAnswerResponse(question, answerValue);

              return (
                <div key={index} className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-start p-5 sm:p-6 gap-5">
                    {/* Status Icon */}
                    <div className="shrink-0">
                      {isPending ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-500 shadow-sm">
                          <Minus className="h-5 w-5" />
                        </div>
                      ) : isPerfect ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 shadow-sm">
                          <Check className="h-5 w-5" />
                        </div>
                      ) : isPartial ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 border border-orange-200 text-orange-600 shadow-sm" title="Partial Credit">
                          <Minus className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 border border-rose-200 text-rose-600 shadow-sm">
                          <X className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-5">
                      {/* Question Header */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="flex-1">
                          <div className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/40">
                            <span>Question {index + 1}</span>
                            <span className="h-1 w-1 rounded-full bg-primary/20" />
                            <span>{question.type.replace(/_/g, " ")}</span>
                          </div>
                          <p className="text-lg font-bold leading-relaxed text-primary">{question.question}</p>
                          {normalizeQuestionRendererType(question.type) === "fill" && question.rawOptions?.template ? (
                            <p className="mt-3 text-base font-medium leading-relaxed text-primary/70">{question.rawOptions.template}</p>
                          ) : null}
                        </div>
                        <div className="shrink-0 rounded-lg bg-slate-50 px-3 py-1.5 border border-slate-100 text-center sm:text-right">
                          <span className="text-sm font-extrabold text-primary">
                            {isPending ? '—' : questionScore} <span className="text-xs font-semibold text-primary/50">/ {question.points} pts</span>
                          </span>
                        </div>
                      </div>

                      {/* Answer Feedback blocks */}
                      <div className="grid gap-4 sm:grid-cols-2 rounded-xl bg-slate-50/50 p-4 border border-slate-100/50">
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold uppercase tracking-widest text-primary/40">Your Answer</p>
                          <div className={isSubjective ? 'text-primary/80' : ''}>
                            <AnswerFeedbackRenderer question={question} value={answerValue} />
                          </div>
                        </div>

                        {!isSubjective && resultMode === "immediate" && showCorrectAnswers && !isCorrect ? (
                          <div className="space-y-2">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-primary/40">Correct Answer</p>
                            <div className="px-4 py-3 rounded-xl text-sm font-medium bg-white border border-emerald-100 text-emerald-800 shadow-sm whitespace-pre-wrap">
                              {getCorrectAnswerText(question)}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-4 text-sm font-bold uppercase tracking-widest text-primary/30">
            <div className="h-px w-12 bg-border/50" />
            End of answer sheet
            <div className="h-px w-12 bg-border/50" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
