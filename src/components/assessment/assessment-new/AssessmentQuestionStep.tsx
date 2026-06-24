"use client";

import { useState, useEffect, useMemo } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/ui/card";
import { Button } from "@/src/components/ui/ui/button";
import { Label } from "@/src/components/ui/ui/label";
import { Input } from "@/src/components/ui/ui/input";
import { DropdownSelect } from "@/src/components/ui/ui/dropdown-select";
import type { QuestionBank, Question } from "@/src/types/api";
import type { NewAssessmentFormData } from "@/src/types/assessment-form.types";
import { fetchBankQuestions } from "@/src/actions/bank-actions";

function getQuestionTypeTone(type: string) {
  switch (type) {
    case "SINGLE_CHOICE":
    case "MULTIPLE_CHOICE":
      return "bg-blue-100 text-blue-700";
    case "TRUE_FALSE":
      return "bg-green-100 text-green-700";
    case "SHORT_ANSWER":
      return "bg-amber-100 text-amber-700";
    case "ESSAY":
      return "bg-rose-100 text-rose-700";
    case "MATCHING":
      return "bg-indigo-100 text-indigo-700";
    case "ORDERING":
      return "bg-fuchsia-100 text-fuchsia-700";
    case "FILL_IN_THE_BLANK":
      return "bg-cyan-100 text-cyan-700";
    case "RATING":
      return "bg-violet-100 text-violet-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getDifficultyTone(difficulty: string) {
  switch (difficulty) {
    case "EASY":
      return "bg-emerald-100 text-emerald-700";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-red-100 text-red-700";
  }
}

export default function AssessmentQuestionStep({
  formData,
  banks,
  questions,
  questionSearch,
  onQuestionSearchChange,
  onChange,
  onQuestionToggle,
  onSelectionRuleChange,
}: {
  formData: NewAssessmentFormData;
  banks: QuestionBank[];
  questions: Question[];
  questionSearch: string;
  onQuestionSearchChange: (value: string) => void;
  onChange: <K extends keyof NewAssessmentFormData>(
    field: K,
    value: NewAssessmentFormData[K],
  ) => void;
  onQuestionToggle: (questionId: string) => void;
  onSelectionRuleChange: (difficulty: "Easy" | "Medium" | "Hard", count: number) => void;
}) {
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (formData.selectedBankId) {
      fetchBankQuestions(formData.selectedBankId).then((data) => {
        setBankQuestions(Array.isArray(data) ? data : []);
      }).catch(console.error);
    } else {
      setBankQuestions([]);
    }
  }, [formData.selectedBankId]);

  const topicBanks = useMemo(() => {
    return banks.filter(
      (b) => String(b.topicId) === String(formData.ownerTopicId) || String(b.topic?.id) === String(formData.ownerTopicId)
    );
  }, [banks, formData.ownerTopicId]);

  const baseQuestions = useMemo(() => {
    if (formData.selectedBankId) {
      return bankQuestions;
    }
    return questions.filter(
      (q) => String(q.topicId) === String(formData.ownerTopicId) || String(q.topic?.id) === String(formData.ownerTopicId)
    );
  }, [formData.selectedBankId, bankQuestions, questions, formData.ownerTopicId]);

  const filteredQuestions = baseQuestions.filter((question) => {
    if (difficultyFilter !== "ALL" && question.difficulty !== difficultyFilter) {
      return false;
    }
    if (typeFilter !== "ALL" && question.type !== typeFilter) {
      return false;
    }

    if (!questionSearch.trim()) {
      return true;
    }

    return question.questionText.toLowerCase().includes(questionSearch.trim().toLowerCase());
  });

  return (
    <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-sm transition-all hover:shadow-md">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 rounded-t-2xl">
        <CardTitle className="text-lg text-slate-800">Question Configuration</CardTitle>
        <CardDescription>
          Choose a source bank and decide whether the set is curated manually or assembled dynamically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {formData.questionSelection === "MANUAL" ? (
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="space-y-2 lg:col-span-1">
              <Label htmlFor="selectedBankId" className="text-sm font-bold text-slate-800">Question bank</Label>
              <DropdownSelect
                value={formData.selectedBankId || ""}
                options={[
                  { value: "", label: "All banks" },
                  ...topicBanks.map((bank) => ({
                    value: bank.id,
                    label: `${bank.name} (${bank.questionCount || 0} questions)`,
                  })),
                ]}
                onChange={(val) => onChange("selectedBankId", val)}
                searchable
                searchPlaceholder="Search banks..."
              />
            </div>
            <div className="space-y-2 lg:col-span-1">
              <Label className="text-sm font-bold text-slate-800">Type</Label>
              <DropdownSelect
                value={typeFilter}
                options={[
                  { value: "ALL", label: "All Types" },
                  { value: "SINGLE_CHOICE", label: "Single Choice" },
                  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
                  { value: "TRUE_FALSE", label: "True/False" },
                  { value: "ORDERING", label: "Ordering" },
                  { value: "FILL_IN_THE_BLANK", label: "Fill in the Blank" },
                  { value: "MATCHING", label: "Matching" },
                  { value: "RATING", label: "Rating" },
                  { value: "SHORT_ANSWER", label: "Short Answer" },
                  { value: "ESSAY", label: "Essay" },
                ]}
                onChange={setTypeFilter}
              />
            </div>
            <div className="space-y-2 lg:col-span-1">
              <Label className="text-sm font-bold text-slate-800">Difficulty</Label>
              <DropdownSelect
                value={difficultyFilter}
                options={[
                  { value: "ALL", label: "All Difficulties" },
                  { value: "EASY", label: "Easy" },
                  { value: "MEDIUM", label: "Medium" },
                  { value: "HARD", label: "Hard" }
                ]}
                onChange={setDifficultyFilter}
              />
            </div>
            <div className="space-y-2 lg:col-span-1">
              <Label htmlFor="questionSearch" className="text-sm font-bold text-slate-800">Search</Label>
              <Input
                id="questionSearch"
                name="questionSearch"
                type="text"
                value={questionSearch}
                onChange={(event) => onQuestionSearchChange(event.target.value)}
                placeholder="Search..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all focus:border-[#C8A246] focus:outline-none focus:ring-2 focus:ring-[#C8A246]/50 placeholder:text-slate-400"
              />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="selectedBankId" className="text-sm font-bold text-slate-800">Question bank</Label>
              <DropdownSelect
                value={formData.selectedBankId || ""}
                options={[
                  { value: "", label: "All banks" },
                  ...topicBanks.map((bank) => ({
                    value: bank.id,
                    label: `${bank.name} (${bank.questionCount || 0} questions)`,
                  })),
                ]}
                onChange={(val) => onChange("selectedBankId", val)}
                searchable
                searchPlaceholder="Search banks..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalQuestions" className="text-sm font-bold text-slate-800">Total questions</Label>
              <Input
                id="totalQuestions"
                name="totalQuestions"
                type="number"
                min={1}
                value={formData.totalQuestions}
                onChange={(event) => onChange("totalQuestions", Number(event.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all focus:border-[#C8A246] focus:outline-none focus:ring-2 focus:ring-[#C8A246]/50"
              />
            </div>
          </div>
        )}

        {formData.questionSelection === "MANUAL" ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-600">
                {formData.selectedQuestionIds.length} question
                {formData.selectedQuestionIds.length === 1 ? "" : "s"} selected
              </p>
              {formData.selectedQuestionIds.length > 0 ? (
                <Button
                  type="button"
                  onClick={() => onChange("selectedQuestionIds", [])}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 bg-white shadow-sm h-8" variant="ghost"
                >
                  Clear selection
                </Button>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-2 sm:p-3">
              <div className="max-h-140 space-y-3 overflow-y-auto pr-1 sm:pr-2">
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((question) => {
                    const selected = formData.selectedQuestionIds.includes(question.id);
                    const bank = formData.selectedBankId 
                      ? topicBanks.find((item) => item.id === formData.selectedBankId)
                      : topicBanks.find((item) => String(item.id) === String(question.topicId));

                    return (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => onQuestionToggle(question.id)}
                        className={`group relative flex w-full flex-col items-start overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#C8A246]/50 focus-visible:ring-offset-2 ${
                          selected
                            ? "border-[#C8A246] bg-[#faf8f3] shadow-md ring-inset ring-1 ring-[#C8A246]"
                            : "border-slate-200/80 bg-white hover:border-[#C8A246]/40 hover:bg-[#faf8f3]/50 hover:shadow-md shadow-sm"
                        }`}
                      >
                        {selected && (
                          <div className="absolute top-0 right-0 h-16 w-16 -translate-y-8 translate-x-8 rounded-full bg-[#C8A246]/10" />
                        )}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between w-full relative z-10">
                          <div className="min-w-0 space-y-3 flex-1 pr-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getQuestionTypeTone(question.type)}`}
                              >
                                {question.type.replace(/_/g, " ")}
                              </span>
                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getDifficultyTone(question.difficulty)}`}
                              >
                                {question.difficulty}
                              </span>
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200">
                                {bank?.name ?? (formData.selectedBankId ? "Unknown bank" : "Topic Question")}
                              </span>
                            </div>
                            <p className="text-sm font-semibold leading-relaxed text-slate-800 sm:text-base whitespace-normal break-words">
                              {question.questionText}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center justify-between gap-3 w-full sm:w-auto sm:block sm:text-right pt-3 border-t border-slate-200/50 sm:border-0 sm:pt-0">
                            <div className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200 shadow-sm">{question.points} pts</div>
                            <div
                              className={`mt-0 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider sm:mt-3 transition-all duration-300 ${
                                selected
                                  ? "bg-[#C8A246] text-white shadow-md shadow-[#C8A246]/20 scale-105"
                                  : "bg-white text-slate-500 border border-slate-200 shadow-sm group-hover:bg-[#C8A246]/10 group-hover:text-[#C8A246] group-hover:border-[#C8A246]/30"
                              }`}
                            >
                              {selected ? "Selected" : "Select"}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500 shadow-sm">
                    No questions match this bank and search combination.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {formData.selectionRules.map((rule) => (
              <div key={rule.difficulty} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 shadow-sm">
                <Label htmlFor={`rule-${rule.difficulty}`} className="block text-sm font-bold text-slate-800">{rule.difficulty}</Label>
                <p className="mt-1 text-xs text-slate-500 whitespace-normal leading-relaxed">Questions to pull from this difficulty bucket.</p>
                <Input
                  id={`rule-${rule.difficulty}`}
                  name={`rule-${rule.difficulty}`}
                  type="number"
                  min={0}
                  value={rule.count}
                  onChange={(event) =>
                    onSelectionRuleChange(rule.difficulty, Number(event.target.value) || 0)
                  }
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all focus:border-[#C8A246] focus:outline-none focus:ring-2 focus:ring-[#C8A246]/50"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
