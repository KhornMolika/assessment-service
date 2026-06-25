"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { Modal } from "@/src/components/ui/ui/modal";
import { Button } from "@/src/components/ui/ui/button";
import { Search, Loader2 } from "lucide-react";
import { fetchTopicQuestions } from "@/src/actions/question-actions";
import { addQuestionsToAssessmentAction } from "@/src/lib/actions/assessment.actions";
import { toast } from "sonner";
import { Label } from "@/src/components/ui/ui/label";
import { Input } from "@/src/components/ui/ui/input";
import { Badge } from "@/src/components/ui/ui/badge";
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
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col h-[70vh]">
        <div className="mb-4 flex-shrink-0">
          <h3 className="text-2xl font-bold font-serif text-primary mb-2">Add Questions</h3>
          <p className="text-sm text-inkd mb-4">
            Select questions from the assessment's topic to append to this assessment.
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="pl-9 bg-slate-50 border-slate-200"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto border rounded-xl border-slate-200 p-2 space-y-2 bg-slate-50/50">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading questions...
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Search className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-900">No questions available</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                All questions from this topic have been added or none match your search.
              </p>
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => handleToggle(q.id)}
              >
                <div className="pt-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    id={`q-${q.id}`}
                    checked={selectedIds.has(q.id)}
                    onChange={() => handleToggle(q.id)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Label
                    htmlFor={`q-${q.id}`}
                    className="text-sm font-medium text-slate-900 leading-snug cursor-pointer block mb-2"
                  >
                    {q.questionText || (q as any).text || "Untitled Question"}
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={getTypeVariant(q.type || "UNKNOWN")}>
                      {(q.type || "UNKNOWN").replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs font-medium text-slate-500">{q.difficulty || "MEDIUM"}</span>
                    <span className="text-xs font-medium text-slate-500">{q.points || 1} pts</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3 flex-shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedIds.size === 0 || isPending}
            className="min-w-[120px]"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : `Add ${selectedIds.size} Questions`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
