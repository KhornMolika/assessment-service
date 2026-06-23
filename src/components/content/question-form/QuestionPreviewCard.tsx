import { useState, useEffect } from "react";
import type { QuestionBank } from "@/src/types/api";
import type { Topic } from "@/src/types/topic.types";
import type { QuestionFormData } from "@/src/types/question-form.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/ui/card";
import { CheckCircle, Circle, Square, Type, AlignLeft, GripVertical, Check, Star, ChevronUp, ChevronDown } from "lucide-react";

function getOptionLabel(index: number) {
  return String.fromCharCode(65 + index);
}

export default function QuestionPreviewCard({
  banks,
  topics,
  formData,
  title = "Preview",
  description,
  showAnswers = false,
  hideMetadata = false,
}: {
  banks: QuestionBank[];
  topics: Topic[];
  formData: QuestionFormData;
  title?: string;
  description?: string;
  showAnswers?: boolean;
  hideMetadata?: boolean;
}) {
  const ownerTopic = topics.find((topic) => topic.id === formData.ownerTopicId);

  const { questionType, options, correctAnswers } = formData;
  
  const [orderingState, setOrderingState] = useState<any[]>([]);
  const [matchingState, setMatchingState] = useState<Record<string, string>>({});
  const [fillInBlankState, setFillInBlankState] = useState<Record<number, string>>({});

  useEffect(() => {
    if (questionType === "Ordering" && !showAnswers) {
      const opts = Array.isArray(options) ? [...options] : [];
      setOrderingState(opts.sort(() => Math.random() - 0.5));
    }
  }, [options, questionType, showAnswers]);

  const moveOrderingItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...orderingState];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setOrderingState(newOrder);
  };

  const renderPreview = () => {
    switch (questionType) {
      case "Single Choice":
      case "Multiple Choices": {
        const isMultiple = questionType === "Multiple Choices";
        const correctIds = isMultiple 
          ? (correctAnswers?.optionIds || []) 
          : (correctAnswers?.optionId ? [correctAnswers.optionId] : []);
        const opts = Array.isArray(options) ? options : [];

        return (
          <div className="space-y-3">
            {opts.map((opt: any, index: number) => {
              const isCorrect = showAnswers && correctIds.includes(opt.id);
              return (
                <div
                  key={opt.id || index}
                  className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-colors ${
                    isCorrect ? "border-yellow-500 bg-yellow-50" : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-sm ${
                      isCorrect ? "text-yellow-600" : "text-slate-400"
                    }`}
                  >
                    {isMultiple ? <Square className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                  </div>
                  <span className={`text-sm flex-1 ${isCorrect ? "text-yellow-800 font-medium" : "text-slate-700"}`}>
                    {opt.text || `Option ${getOptionLabel(index)}`}
                  </span>
                  {isCorrect && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-[10px] font-bold text-yellow-700 uppercase tracking-wider">
                      <CheckCircle className="h-3 w-3" />
                      Correct
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      case "True/False": {
        const isTrue = correctAnswers?.value === true;
        const trueLabel = options?.trueLabel || "True";
        const falseLabel = options?.falseLabel || "False";
        
        return (
          <div className="grid grid-cols-2 gap-4">
            {[trueLabel, falseLabel].map((label, idx) => {
              const isOptionTrue = idx === 0;
              const isCorrect = showAnswers && ((isOptionTrue && isTrue) || (!isOptionTrue && !isTrue));
              return (
                <div
                  key={label}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-colors ${
                    isCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-100 bg-slate-50 text-slate-500"
                  }`}
                >
                  <Circle className={`h-6 w-6 mb-2 ${isCorrect ? "text-emerald-500" : "text-slate-300"}`} />
                  <span className="text-sm font-bold">{label}</span>
                </div>
              );
            })}
          </div>
        );
      }

      case "Ordering": {
        const sequenceIds = correctAnswers?.sequence || [];
        const opts = Array.isArray(options) ? options : [];
        
        // In participant mode, we would randomize options. In preview with answers, we show the correct sequence.
        const itemsToRender = showAnswers && sequenceIds.length > 0
          ? sequenceIds.map((id:string) => opts.find((o:any) => o.id === id) || { text: id })
          : opts;

        return (
          <div className="space-y-2">
            {itemsToRender.map((opt: any, index: number) => (
              <div
                key={index}
                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-1 text-sm font-medium ${
                  showAnswers ? "border-purple-300 bg-purple-50 text-purple-800" : "border-slate-100 bg-slate-50 text-slate-700"
                }`}
              >
                {showAnswers ? (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white shadow-sm">
                    {index + 1}
                  </span>
                ) : (
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => moveOrderingItem(index, 'up')} disabled={index === 0} className="text-slate-400 hover:text-purple-600 disabled:opacity-30 p-1.5 sm:p-2 transition-colors rounded-md hover:bg-purple-50">
                      <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button onClick={() => moveOrderingItem(index, 'down')} disabled={index === itemsToRender.length - 1} className="text-slate-400 hover:text-purple-600 disabled:opacity-30 p-1.5 sm:p-2 transition-colors rounded-md hover:bg-purple-50">
                      <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                )}
                <span>{opt.text || `Item ${index + 1}`}</span>
              </div>
            ))}
          </div>
        );
      }

      case "Matching": {
        const leftSide = options?.leftSide || [];
        const rightSide = options?.rightSide || [];
        const pairs = correctAnswers?.pairs || [];
        
        return (
          <div className="flex flex-col gap-3">
            {pairs.map((pair: any, index: number) => {
              const leftText = leftSide.find((l: any) => l.id === pair.leftId)?.text || `Left ${index + 1}`;
              const rightText = rightSide.find((r: any) => r.id === pair.rightId)?.text || `Right ${index + 1}`;
              
              // If not showing answers, offset the right text
              const displayRightText = showAnswers || pairs.length <= 1 
                ? rightText 
                : (rightSide.find((r: any) => r.id === pairs[(index + 1) % pairs.length]?.rightId)?.text || `Right ${(index + 1) % pairs.length + 1}`);

              return (
                <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 text-center font-medium">
                    {leftText}
                  </div>
                  <div className="hidden sm:flex text-slate-300 shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </div>
                  {showAnswers ? (
                    <div className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium text-center relative flex items-center justify-center border-orange-400 bg-orange-50 text-orange-800`}>
                      <span>{displayRightText}</span>
                      <CheckCircle className="absolute right-3 h-4 w-4 text-orange-500" />
                    </div>
                  ) : (
                    <div className="flex-1 relative">
                      <select
                        value={matchingState[pair.leftId] || ""}
                        onChange={(e) => setMatchingState(prev => ({ ...prev, [pair.leftId]: e.target.value }))}
                        className="w-full appearance-none rounded-xl border-2 border-slate-200 bg-white pl-4 pr-10 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm cursor-pointer"
                      >
                        <option value="" disabled>Select match...</option>
                        {rightSide.map((r: any, rIndex: number) => (
                          <option key={r.id} value={r.id}>{r.text || `Right ${rIndex + 1}`}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      case "Fill in the Blank": {
        const template = options?.template || "Your template will appear here...";
        const answers = correctAnswers?.answers || [];
        
        const renderFillInTheBlankTemplate = () => {
          const parts = template.split(/(\[blank_\d+\])/g);
          return (
            <div className="leading-loose text-slate-800 text-base">
              {parts.map((part: string, index: number) => {
                const match = part.match(/\[blank_(\d+)\]/);
                if (match) {
                  const blankIdx = parseInt(match[1], 10) - 1;
                  if (showAnswers) {
                     return <span key={index} className="bg-pink-100 text-pink-700 font-bold px-2 py-1 mx-1 rounded shadow-sm">{part}</span>;
                  }
                  return (
                    <input 
                      key={index}
                      className="mx-1 inline-block w-32 border-b-2 border-slate-300 bg-white px-2 py-1 text-center text-sm font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-normal focus:border-pink-500 focus:outline-none focus:ring-0 transition-colors shadow-sm rounded-t-md"
                      placeholder={`Blank ${blankIdx + 1}`}
                      value={fillInBlankState[blankIdx] || ""}
                      onChange={(e) => setFillInBlankState(prev => ({...prev, [blankIdx]: e.target.value}))}
                    />
                  );
                }
                return <span key={index}>{part}</span>;
              })}
            </div>
          );
        };

        return (
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              {renderFillInTheBlankTemplate()}
            </div>
            
            {showAnswers && answers.length > 0 && (
              <div className="rounded-xl border border-pink-200 bg-pink-50/50 p-4">
                <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-pink-600">Expected Answers</div>
                <div className="flex flex-col gap-2">
                  {answers.map((ansGroup: string[], idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-pink-600 font-bold text-xs mt-1 w-16">[blank_{idx + 1}]</span>
                      <div className="flex flex-wrap gap-1.5">
                        {ansGroup.map((ans, i) => (
                          <span key={i} className="bg-white border border-pink-200 text-pink-700 px-2.5 py-0.5 rounded shadow-sm text-xs font-medium">
                            {ans || "empty"}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      case "Short Answer":
      case "Essay": {
        const keywords = correctAnswers?.keyPointsExpected || [];
        const minWords = options?.minWords || 0;
        const maxWords = options?.maxWords || 0;

        return (
          <div className="space-y-4">
            <textarea 
              disabled 
              placeholder="Participant's answer will go here..." 
              rows={questionType === "Essay" ? 5 : 2}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-400 resize-none focus:outline-none"
            />
            
            {showAnswers && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-4">
                <div className="flex gap-3 text-xs font-medium text-blue-800">
                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm">
                    <AlignLeft className="h-3 w-3 text-blue-400" /> Min: {minWords}
                  </div>
                  {maxWords > 0 && (
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm">
                      <AlignLeft className="h-3 w-3 text-blue-400" /> Max: {maxWords}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    <Type className="h-3 w-3" /> Expected Key Points
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {keywords.length > 0 && keywords[0] !== "" ? (
                      keywords.map((kw: string, idx: number) => (
                        <span key={idx} className="bg-white border border-blue-200 text-blue-700 px-2 py-0.5 rounded text-xs shadow-sm font-medium">
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-blue-700/50 italic">None specified</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      case "Rating Scale": {
        const max = options?.max || 5;
        const lowLabel = options?.lowLabel || "Low";
        const highLabel = options?.highLabel || "High";

        return (
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {Array.from({ length: max }).map((_, i) => (
                <Star 
                  key={i} 
                  className="h-8 w-8 sm:h-10 sm:w-10 text-slate-200 fill-slate-50 transition-colors hover:text-yellow-400 hover:fill-yellow-400 cursor-pointer" 
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <div className="flex justify-between px-2 sm:px-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              <span className="text-center w-1/3 text-left">{lowLabel}</span>
              <span className="text-center w-1/3 text-right">{highLabel}</span>
            </div>
          </div>
        );
      }

      default:
        return (
          <div className="p-6 text-center text-sm text-slate-400 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
            Preview is not available for this type yet.
          </div>
        );
    }
  };

  return (
    <Card className="shadow-sm border-slate-200 overflow-hidden bg-white relative">
      <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <svg width="20" height="20" className="text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l2-9 5 18 2-9h5"/></svg>
              {title}
            </CardTitle>
            {description ? <CardDescription className="mt-1">{description}</CardDescription> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        <div className="p-5 mt-6 rounded-2xl bg-white border border-indigo-100 shadow-sm">
          <div className="mb-4">
            <div className="flex items-start gap-2">
              <span className="text-sm font-black text-indigo-300 mt-0.5">Q.</span>
              <p className="flex-1 text-sm font-medium text-slate-800 leading-relaxed">
                {formData.questionText || <span className="text-slate-400 italic">Your question text will appear here...</span>}
              </p>
              {!hideMetadata && (
                <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  {formData.points} {Number(formData.points) === 1 ? "pt" : "pts"}
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100">
            {renderPreview()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
