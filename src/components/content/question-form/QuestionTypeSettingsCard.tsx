import type { ReactNode } from "react";
import type { QuestionFormData } from "@/src/types/question-form.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/ui/card";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Check, GripVertical, Plus, X, Type, ListOrdered, Link as LinkIcon, Edit3, MessageSquare, Star, FileQuestion, ChevronUp, ChevronDown } from "lucide-react";
import { Label } from "@/src/components/ui/ui/label";
import { Button } from "@/src/components/ui/ui/button";
import { Select } from "@/src/components/ui/ui/select";
import { Input } from "@/src/components/ui/ui/input";
import { Textarea } from "@/src/components/ui/ui/textarea";

function getOptionLabel(index: number) {
  return String.fromCharCode(65 + index);
}

export default function QuestionTypeSettingsCard({
  formData,
  onChange,
  title = "Question Settings",
  description,
  extraContent,
}: {
  formData: QuestionFormData;
  onChange: <K extends keyof QuestionFormData>(field: K, value: QuestionFormData[K]) => void;
  title?: string;
  description?: string;
  extraContent?: ReactNode;
}) {
  const renderContent = () => {
    switch (formData.questionType) {
      case "Single Choice":
      case "Multiple Choices": {
        const isMultiple = formData.questionType === "Multiple Choices";
        const options = Array.isArray(formData.options) ? formData.options : [];
        const correctIds = isMultiple 
          ? (formData.correctAnswers?.optionIds || []) 
          : (formData.correctAnswers?.optionId ? [formData.correctAnswers.optionId] : []);

        const updateOption = (index: number, val: string) => {
          const newOpts = [...options];
          newOpts[index] = { ...newOpts[index], text: val };
          onChange("options", newOpts);
        };

        const toggleCorrect = (id: string) => {
          if (!isMultiple) {
            onChange("correctAnswers", { optionId: id });
          } else {
            const newIds = correctIds.includes(id) 
              ? correctIds.filter((cid: string) => cid !== id) 
              : [...correctIds, id];
            onChange("correctAnswers", { optionIds: newIds });
          }
        };

        const addOption = () => {
          const newId = `opt_${Date.now()}`;
          onChange("options", [...options, { id: newId, text: "" }]);
        };

        const removeOption = (index: number, id: string) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newOpts = options.filter((_: any, i: number) => i !== index);
          onChange("options", newOpts);
          if (!isMultiple && correctIds.includes(id)) {
            onChange("correctAnswers", { optionId: newOpts[0]?.id || "" });
          } else if (isMultiple && correctIds.includes(id)) {
            onChange("correctAnswers", { optionIds: correctIds.filter((cid: string) => cid !== id) });
          }
        };

        return (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                <ListOrdered className="h-5 w-5" />
              </div>
              <div>
                <Label className="block text-sm font-bold text-slate-800">Answer Options</Label>
                <p className="text-xs text-slate-500">
                  {isMultiple ? "Check all correct answers" : "Select the single correct answer"}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {options.map((opt: any, index: number) => {
                const isCorrect = correctIds.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    className={`group flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all duration-300 hover:shadow-md ${
                      isCorrect ? "border-yellow-500 bg-yellow-50/50" : "border-slate-200 bg-white hover:border-yellow-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleCorrect(opt.id)}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center transition-all duration-200 ${
                        !isMultiple ? "rounded-full" : "rounded-md"
                      } ${
                        isCorrect
                          ? "bg-yellow-500 text-white border-transparent"
                          : "border-2 border-slate-300 bg-white hover:border-yellow-400"
                      }`}
                    >
                      {isCorrect && <Check className="h-4 w-4" />}
                    </button>
                    <span className="w-6 text-sm font-bold text-slate-400">
                      {getOptionLabel(index)}
                    </span>
                    <Input
                      type="text"
                      placeholder={`Option ${getOptionLabel(index)}`}
                      value={opt.text}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0 px-0 text-sm font-medium text-slate-700 placeholder:text-slate-400"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index, opt.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
              <Button
                type="button"
                onClick={addOption}
                variant="outline"
                className="w-full mt-2 border-dashed border-2 border-slate-300 text-slate-500 hover:text-yellow-600 hover:border-yellow-300 hover:bg-yellow-50 transition-all rounded-xl py-6"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Option
              </Button>
            </div>
          </div>
        );
      }

      case "True/False": {
        const isTrue = formData.correctAnswers?.value === true;
        const setCorrect = (val: boolean) => onChange("correctAnswers", { value: val });
        const labels = formData.options || { trueLabel: "True", falseLabel: "False" };

        return (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <Label className="block text-sm font-bold text-slate-800">Correct Answer</Label>
                <p className="text-xs text-slate-500">Select whether the statement is true or false</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: labels.trueLabel, value: true },
                { label: labels.falseLabel, value: false },
              ].map((opt) => {
                const isCorrect = isTrue === opt.value;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setCorrect(opt.value)}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                      isCorrect 
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                        : "border-slate-200 bg-white text-slate-500 hover:border-emerald-300"
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full mb-3 ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-100'}`}>
                      {isCorrect && <Check className="h-5 w-5" />}
                    </div>
                    <span className="font-bold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case "Short Answer":
      case "Essay": {
        const keywords = formData.correctAnswers?.keyPointsExpected || [];
        const updateKeyword = (index: number, val: string) => {
          const newKws = [...keywords];
          newKws[index] = val;
          onChange("correctAnswers", { ...formData.correctAnswers, keyPointsExpected: newKws });
        };
        const removeKeyword = (index: number) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange("correctAnswers", { ...formData.correctAnswers, keyPointsExpected: keywords.filter((_: any, i: number) => i !== index) });
        };

        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <Label className="block text-sm font-bold text-slate-800">Word Count Limits</Label>
                  <p className="text-xs text-slate-500">Set boundaries for the response</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">Minimum Words</Label>
                  <Input 
                    type="number" 
                    value={formData.options?.minWords || 0} 
                    onChange={(e) => onChange("options", { ...formData.options, minWords: parseInt(e.target.value) || 0 })}
                    className="rounded-xl border-slate-200 focus:ring-blue-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600">Maximum Words</Label>
                  <Input 
                    type="number" 
                    value={formData.options?.maxWords || 0} 
                    onChange={(e) => onChange("options", { ...formData.options, maxWords: parseInt(e.target.value) || 0 })}
                    className="rounded-xl border-slate-200 focus:ring-blue-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-bold text-slate-800">Expected Key Points</Label>
                <p className="text-xs text-slate-500">Keywords the AI will look for when grading</p>
              </div>
              <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                {keywords.map((kw: string, index: number) => (
                  <div key={index} className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg pl-3 pr-1 py-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all">
                    <input
                      type="text"
                      value={kw}
                      onChange={(e) => updateKeyword(index, e.target.value)}
                      placeholder="Keyword"
                      className="border-none bg-transparent text-sm w-24 focus:outline-none font-medium text-slate-700"
                    />
                    <button type="button" onClick={() => removeKeyword(index)} className="p-1 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => onChange("correctAnswers", { ...formData.correctAnswers, keyPointsExpected: [...keywords, ""] })}
                  className="flex items-center justify-center h-8 w-8 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="block text-sm font-bold text-slate-800">Model Answer Reference</Label>
              <Textarea
                placeholder="Provide a perfect example answer for AI grading reference..."
                value={formData.correctAnswers?.modelAnswerReference || ""}
                onChange={(e) => onChange("correctAnswers", { ...formData.correctAnswers, modelAnswerReference: e.target.value })}
                className="rounded-xl border-slate-200 min-h-[100px] focus:ring-blue-500/50"
              />
            </div>
          </div>
        );
      }

      case "Fill in the Blank": {
        const answers = formData.correctAnswers?.answers || [];
        
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <Label className="block text-sm font-bold text-slate-800">Template Text</Label>
                  <p className="text-xs text-slate-500">Use `[blank_1]`, `[blank_2]`, etc. to define blanks</p>
                </div>
              </div>
              <Textarea
                value={formData.options?.template || ""}
                onChange={(e) => onChange("options", { template: e.target.value })}
                placeholder="The [blank_1] is the powerhouse of the [blank_2]."
                className="rounded-xl border-slate-200 min-h-[100px] focus:ring-pink-500/50 text-base leading-relaxed"
              />
            </div>

            <div className="space-y-3">
              <Label className="block text-sm font-bold text-slate-800">Accepted Answers per Blank</Label>
              <div className="space-y-3">
                {answers.map((ansGroup: string[], index: number) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2">
                    <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">[blank_{index + 1}]</span>
                    <div className="flex flex-wrap gap-2">
                      {ansGroup.map((ans, i) => (
                        <div key={i} className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg pl-3 pr-1 py-1 shadow-sm">
                          <input
                            value={ans}
                            onChange={(e) => {
                              const newGroups = [...answers];
                              newGroups[index][i] = e.target.value;
                              onChange("correctAnswers", { answers: newGroups });
                            }}
                            className="border-none bg-transparent text-sm w-24 focus:outline-none font-medium text-slate-700"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const newGroups = [...answers];
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              newGroups[index] = newGroups[index].filter((_: any, idx: number) => idx !== i);
                              onChange("correctAnswers", { answers: newGroups });
                            }} 
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newGroups = [...answers];
                          newGroups[index] = [...newGroups[index], ""];
                          onChange("correctAnswers", { answers: newGroups });
                        }}
                        className="flex items-center justify-center h-8 w-8 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onChange("correctAnswers", { answers: [...answers, [""]] })}
                    className="text-pink-600 border-pink-200 hover:bg-pink-50"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Blank Definition
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case "Matching": {
        const leftSide = formData.options?.leftSide || [];
        const rightSide = formData.options?.rightSide || [];
        const pairs = formData.correctAnswers?.pairs || [];

        return (
          <div className="space-y-4 animate-in fade-in duration-500">
             <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <LinkIcon className="h-5 w-5" />
              </div>
              <div>
                <Label className="block text-sm font-bold text-slate-800">Matching Pairs</Label>
                <p className="text-xs text-slate-500">Define the pairs; they will be shuffled for participants.</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {pairs.map((pair: any, index: number) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const lText = leftSide.find((l:any) => l.id === pair.leftId)?.text || "";
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const rText = rightSide.find((r:any) => r.id === pair.rightId)?.text || "";

                return (
                  <div key={index} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <Input
                      placeholder="Left item"
                      value={lText}
                      onChange={(e) => {
                        const newL = [...leftSide];
                        newL[index] = { id: pair.leftId, text: e.target.value };
                        onChange("options", { ...formData.options, leftSide: newL });
                      }}
                      className="bg-white rounded-lg border-slate-300"
                    />
                    <div className="text-orange-400">
                      <LinkIcon className="h-4 w-4" />
                    </div>
                    <Input
                      placeholder="Right item"
                      value={rText}
                      onChange={(e) => {
                        const newR = [...rightSide];
                        newR[index] = { id: pair.rightId, text: e.target.value };
                        onChange("options", { ...formData.options, rightSide: newR });
                      }}
                      className="bg-white rounded-lg border-slate-300"
                    />
                    {pairs.length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          onChange("options", {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            leftSide: leftSide.filter((_:any, i:number) => i !== index),
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            rightSide: rightSide.filter((_:any, i:number) => i !== index),
                          });
                          onChange("correctAnswers", {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            pairs: pairs.filter((_:any, i:number) => i !== index)
                          });
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-lg border border-slate-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const newIdx = Date.now();
                  const lId = `l_${newIdx}`;
                  const rId = `r_${newIdx}`;
                  onChange("options", {
                    leftSide: [...leftSide, { id: lId, text: "" }],
                    rightSide: [...rightSide, { id: rId, text: "" }]
                  });
                  onChange("correctAnswers", {
                    pairs: [...pairs, { leftId: lId, rightId: rId }]
                  });
                }}
                className="w-full border-dashed border-2 border-slate-300 text-slate-500 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Pair
              </Button>
            </div>
          </div>
        );
      }

      case "Ordering": {
        const options = formData.options || [];
        
        const moveOpt = (index: number, dir: 'up'|'down') => {
          const target = dir === 'up' ? index - 1 : index + 1;
          if (target < 0 || target >= options.length) return;
          const newOpts = [...options];
          [newOpts[index], newOpts[target]] = [newOpts[target], newOpts[index]];
          onChange("options", newOpts);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange("correctAnswers", { sequence: newOpts.map((o:any) => o.id) });
        };

        return (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <ListOrdered className="h-5 w-5" />
              </div>
              <div>
                <Label className="block text-sm font-bold text-slate-800">Correct Sequence</Label>
                <p className="text-xs text-slate-500">Add items in the exact order they should be arranged.</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {options.map((opt: any, index: number) => (
                <div key={opt.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm transition hover:shadow-md hover:border-primary/30">
                  <div className="flex flex-col gap-1">
                    <button type="button" onClick={() => moveOpt(index, 'up')} disabled={index === 0} className="text-slate-400 hover:text-primary disabled:opacity-30 p-1.5 sm:p-2 transition-colors rounded-md hover:bg-primary/5">
                      <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                    <button type="button" onClick={() => moveOpt(index, 'down')} disabled={index === options.length - 1} className="text-slate-400 hover:text-primary disabled:opacity-30 p-1.5 sm:p-2 transition-colors rounded-md hover:bg-primary/5">
                      <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center bg-primary/10 text-primary font-bold rounded-md text-sm shrink-0">
                    {index + 1}
                  </div>
                  <Input
                    value={opt.text}
                    onChange={(e) => {
                      const newOpts = [...options];
                      newOpts[index] = { ...opt, text: e.target.value };
                      onChange("options", newOpts);
                    }}
                    placeholder={`Item ${index + 1}`}
                    className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0 px-0 font-medium"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const newOpts = options.filter((_:any, i:number) => i !== index);
                        onChange("options", newOpts);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange("correctAnswers", { sequence: newOpts.map((o:any) => o.id) });
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const id = `opt_${Date.now()}`;
                  const newOpts = [...options, { id, text: "" }];
                  onChange("options", newOpts);
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange("correctAnswers", { sequence: newOpts.map((o:any) => o.id) });
                }}
                className="w-full border-dashed border-2 border-slate-300 text-slate-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Step
              </Button>
            </div>
          </div>
        );
      }

      case "Rating Scale": {
        const min = formData.options?.min || 1;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const max = formData.options?.max || 5;
        const lowLabel = formData.options?.lowLabel || "";
        const highLabel = formData.options?.highLabel || "";

        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <Label className="block text-sm font-bold text-slate-800">Rating Scale Configuration</Label>
                <p className="text-xs text-slate-500">Configure the range and labels for the rating.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-600 uppercase">Min Value</Label>
                  <Select
                    value={String(min)}
                    onChange={(e) => onChange("options", { ...formData.options, min: parseInt(e.target.value) })}
                    className="bg-white"
                  >
                    <option value="0">0</option>
                    <option value="1">1</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-600 uppercase">Min Label</Label>
                  <Input 
                    value={lowLabel}
                    onChange={(e) => onChange("options", { ...formData.options, lowLabel: e.target.value })}
                    placeholder="e.g. Strongly Disagree"
                    className="bg-white"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-600 uppercase">Max Value</Label>
                  <Select
                    value="5"
                    disabled
                    className="bg-slate-100 text-slate-500 cursor-not-allowed opacity-70"
                  >
                    <option value="5">5</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-600 uppercase">Max Label</Label>
                  <Input 
                    value={highLabel}
                    onChange={(e) => onChange("options", { ...formData.options, highLabel: e.target.value })}
                    placeholder="e.g. Strongly Agree"
                    className="bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      }

      default:
        return (
          <div className="flex flex-col items-center justify-center p-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
            <FileQuestion className="h-12 w-12 mb-3 text-slate-300" />
            <p className="text-sm font-medium">Select a question type to configure its settings</p>
          </div>
        );
    }
  };

  return (
    <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-sm">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 rounded-t-2xl">
        <CardTitle className="text-lg text-slate-800">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="pt-6">
        {renderContent()}
        {extraContent}
      </CardContent>
    </Card>
  );
}
