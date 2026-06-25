"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { Modal } from "@/src/components/ui/ui/modal";
import { Button } from "@/src/components/ui/ui/button";
import { Search, Loader2, Check } from "lucide-react";
import { fetchTopicQuestions } from "@/src/actions/question-actions";
import { addQuestionsToAssessmentAction } from "@/src/lib/actions/assessment.actions";
import { toast } from "sonner";
import { Input } from "@/src/components/ui/ui/input";
import type { Question } from "@/src/types/api";

function getTypeVariant(type: string) {
  switch (type) {
    case "SINGLE_CHOICE":
    case "MULTIPLE_CHOICE":
      return "info" as const;
    case "TRUE_FALSE":
      return "success" as const;
    case "SHORT_ANSWER":
      return "secondary" as const;
    case "ESSAY":
      return "pending" as const;
    case "RATING":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

export interface AddAssessmentQuestionsModalProps {
  open: boolean;
  onClose: () => void;
  assessmentId: string;
  topicId: string;
  existingQuestionIds: string[];
}

export default function AddAssessmentQuestionsModal({
  open,
  onClose,
  assessmentId,
  topicId,
  existingQuestionIds,
}: AddAssessmentQuestionsModalProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open && topicId) {
      setLoading(true);
      setSelectedIds(new Set());
      setSearch("");
      fetchTopicQuestions(topicId)
        .then((res) => {
          const data = Array.isArray(res) ? res : (res as any)?.data || [];
          setQuestions(data);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load questions");
        })
        .finally(() => setLoading(false));
    }
  }, [open, topicId]);

  const availableQuestions = useMemo(() => {
    return questions.filter((q) => !existingQuestionIds.includes(q.id));
  }, [questions, existingQuestionIds]);

  const filteredQuestions = useMemo(() => {
    if (!search.trim()) return availableQuestions;
    return availableQuestions.filter((q) => {
      const qText = q.questionText || (q as any).text || "";
      return qText.toLowerCase().includes(search.trim().toLowerCase());
    });
  }, [availableQuestions, search]);

  const handleToggle = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleAdd = () => {
    if (selectedIds.size === 0) return;
    
    startTransition(async () => {
      const res = await addQuestionsToAssessmentAction(assessmentId, Array.from(selectedIds));
      if (res?.success) {
        toast.success("Questions added successfully");
        onClose();
      } else {
        toast.error(res?.message || "Failed to add questions");
      }
    });
  };

  return (
    <Modal open={open} onClose={onClose} className="max-w-4xl flex flex-col max-h-[85vh]">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-primary">Add Questions</h2>
          <p className="text-sm text-inkd mt-1">Select questions from the assessment's topic to append to this assessment.</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-inkd" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by text..."
            className="pl-9 w-full rounded-lg border-border focus:ring-pm"
          />
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto pr-2 min-h-75">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-inkd" />
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-inkd pt-12">
            <p>No questions found.</p>
            {questions.length === 0 && <p className="text-sm mt-1">All available topic questions are already added.</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredQuestions.map((q) => {
              const isSelected = selectedIds.has(q.id);
              return (
                <div
                  key={q.id}
                  onClick={() => handleToggle(q.id)}
                  className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-border hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-primary line-clamp-2 leading-snug">
                      {q.questionText || (q as any).text || "Untitled Question"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                      <span className="rounded bg-white border px-2 py-0.5">{(q.type || "UNKNOWN").replace(/_/g, " ")}</span>
                      <span className="rounded bg-white border px-2 py-0.5 capitalize">{q.difficulty || "MEDIUM"}</span>
                      <span className="rounded bg-white border px-2 py-0.5">{q.points || 1} pts</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <Button variant="ghost" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button onClick={handleAdd} disabled={selectedIds.size === 0 || isPending} className="bg-pm hover:bg-pm/90 text-white min-w-[120px]">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add {selectedIds.size} Question{selectedIds.size !== 1 && "s"}
        </Button>
      </div>
    </Modal>
  );
}
