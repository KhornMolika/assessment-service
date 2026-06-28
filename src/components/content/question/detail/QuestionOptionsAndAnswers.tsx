import { CheckCircle, Circle, Square, Type, AlignLeft } from "lucide-react";
import type { ApiQuestionResponse } from "@/src/types/question-detail.types";

export default function QuestionOptionsAndAnswers({ question }: { question: ApiQuestionResponse }) {
  const { type, options, correctAnswers } = question;

  if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
    const isMultiple = type === "MULTIPLE_CHOICE";
    const correctIds = isMultiple 
      ? (correctAnswers?.optionIds || []) 
      : (correctAnswers?.optionId ? [correctAnswers.optionId] : []);
    const opts = Array.isArray(options) ? options : [];

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700 mb-4">Options</h4>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {opts.map((opt: any) => {
          const isCorrect = correctIds.includes(opt.id);
          return (
            <div
              key={opt.id}
              className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 ${
                isCorrect ? "border-green-500 bg-green-50" : "border-border bg-card"
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-sm ${
                  isCorrect ? "text-green-500" : "text-gray-400"
                }`}
              >
                {isMultiple ? <Square className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              </div>
              <span className={`text-sm flex-1 ${isCorrect ? "text-green-700 font-medium" : "text-slate-700"}`}>
                {opt.text}
              </span>
              {isCorrect && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  CORRECT
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (type === "TRUE_FALSE") {
    const isTrue = correctAnswers?.value === true;
    const trueLabel = options?.trueLabel || "True";
    const falseLabel = options?.falseLabel || "False";
    
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700 mb-4">True / False Options</h4>
        {[trueLabel, falseLabel].map((label, idx) => {
          const isOptionTrue = idx === 0;
          const isCorrect = (isOptionTrue && isTrue) || (!isOptionTrue && !isTrue);
          return (
            <div
              key={label}
              className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 ${
                isCorrect ? "border-green-500 bg-green-50" : "border-border bg-card"
              }`}
            >
              <Circle className={`h-4 w-4 ${isCorrect ? "text-green-500" : "text-gray-400"}`} />
              <span className={`text-sm flex-1 ${isCorrect ? "text-green-700 font-medium" : "text-slate-700"}`}>
                {label}
              </span>
              {isCorrect && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  CORRECT
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (type === "ORDERING") {
    const sequenceIds = correctAnswers?.sequence || [];
    const opts = Array.isArray(options) ? options : [];
    
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-700 mb-4">Correct Sequence</h4>
        {sequenceIds.map((id: string, index: number) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const optText = opts.find((o: any) => o.id === id)?.text || id;
          return (
            <div
              key={`${id}-${index}`}
              className="flex items-center gap-3 rounded-lg border-2 border-green-500 bg-green-50 px-4 py-3 text-sm text-green-700 font-medium"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white">
                {index + 1}
              </span>
              <span>{optText}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if (type === "MATCHING") {
    const leftSide = options?.leftSide || [];
    const rightSide = options?.rightSide || [];
    const pairs = correctAnswers?.pairs || [];
    
    return (
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold text-slate-700 mb-2">Matching Pairs</h4>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {pairs.map((pair: any, index: number) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const leftText = leftSide.find((l: any) => l.id === pair.leftId)?.text || pair.leftId;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rightText = rightSide.find((r: any) => r.id === pair.rightId)?.text || pair.rightId;
          
          return (
            <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 rounded-lg border border-border bg-slate-50 px-4 py-3 text-sm text-slate-700 text-center">
                {leftText}
              </div>
              <div className="hidden sm:flex text-green-500 shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </div>
              <div className="flex-1 rounded-lg border-2 border-green-500 bg-green-50 px-4 py-3 text-sm text-green-700 font-medium text-center relative flex items-center justify-center">
                <span>{rightText}</span>
                <CheckCircle className="absolute right-3 h-4 w-4 text-green-500" />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (type === "FILL_IN_THE_BLANK") {
    const template = options?.template || "";
    const answers = correctAnswers?.answers || [];
    
    // Highlight the template placeholders
    const formattedTemplate = template.replace(/\[blank_\d+\]/g, (match: string) => {
      return `<span class="bg-indigo-100 text-indigo-700 font-bold px-1 rounded">${match}</span>`;
    });

    return (
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Template</h4>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedTemplate }} />
        </div>
        
        <div className="rounded-lg border-2 border-green-500 bg-green-50 px-4 py-4 text-sm">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-green-600">Expected Answers per Blank</div>
          <div className="flex flex-col gap-3">
            {answers.map((ansGroup: string[], idx: number) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-1.5 w-16">[blank_{idx + 1}]</span>
                <div className="flex flex-wrap gap-2">
                  {ansGroup.map((ans, i) => (
                    <span key={i} className="bg-white border border-green-200 text-green-700 px-3 py-1 rounded-md shadow-sm">
                      {ans}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === "SHORT_ANSWER" || type === "ESSAY") {
    const keywords = correctAnswers?.keyPointsExpected || [];
    const modelAnswer = correctAnswers?.modelAnswerReference || "";
    const minWords = options?.minWords || 0;
    const maxWords = options?.maxWords || 0;

    return (
      <div className="space-y-6">
        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-sm">
            <AlignLeft className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">Min Words: <strong>{minWords}</strong></span>
          </div>
          {maxWords > 0 && (
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-sm">
              <AlignLeft className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">Max Words: <strong>{maxWords}</strong></span>
            </div>
          )}
        </div>

        <div className="rounded-lg border-2 border-green-500 bg-green-50 px-4 py-4">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-green-600">
            <Type className="h-4 w-4" /> Expected Key Points
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {keywords.length > 0 ? (
              keywords.map((kw: string, idx: number) => (
                <span key={idx} className="bg-white border border-green-200 text-green-700 px-3 py-1 rounded text-sm shadow-sm font-medium">
                  {kw}
                </span>
              ))
            ) : (
              <span className="text-sm text-green-700/70 italic">No key points specified</span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-green-600">
            Model Answer Reference
          </div>
          <div className="bg-white border border-green-200 text-green-800 p-4 rounded-lg text-sm italic leading-relaxed shadow-sm">
            {modelAnswer || "No model answer provided."}
          </div>
        </div>
      </div>
    );
  }

  if (type === "RATING") {
    const min = options?.min || 1;
    const max = options?.max || 5;
    const lowLabel = options?.lowLabel || "Low";
    const highLabel = options?.highLabel || "High";

    return (
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-2">Rating Scale Configuration</h4>
        <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-700">{min}</div>
            <div className="text-xs text-slate-500 mt-1 uppercase font-semibold">{lowLabel}</div>
          </div>
          <div className="flex-1 border-t-2 border-dashed border-slate-300 mx-6"></div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-700">{max}</div>
            <div className="text-xs text-slate-500 mt-1 uppercase font-semibold">{highLabel}</div>
          </div>
        </div>
        <p className="text-sm text-slate-500 italic mt-2">Ratings are inherently subjective and usually not auto-graded.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500 italic text-center">
      Options and answers preview not fully implemented for {type}.
    </div>
  );
}
