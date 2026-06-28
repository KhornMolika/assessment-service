"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/src/components/ui/ui/modal";
import { Button } from "@/src/components/ui/ui/button";
import { Input } from "@/src/components/ui/ui/input";
import { Search, Loader2, Plus, Check } from "lucide-react";
import { fetchGlobalQuestions } from "@/src/actions/question-actions";
import { addQuestionsToBank } from "@/src/actions/bank-actions";
import type { Question } from "@/src/types/api";

export default function AddQuestionsToBankModal({
  open,
  onClose,
  bankId,
  existingQuestionIds,
  onRefresh,
}: {
  open: boolean;
  onClose: () => void;
  bankId: string;
  existingQuestionIds: string[];
  onRefresh?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIds([]);
      setSearch("");
      setIsLoading(true);
      fetchGlobalQuestions()
        .then((data) => {
          // Filter out questions that are already in the bank
          const apiQuestions = data as unknown as Question[];
          setQuestions(apiQuestions.filter((q) => !existingQuestionIds.includes(q.id)));
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [open, existingQuestionIds]);

  const filteredQuestions = questions.filter(
    (q) =>
      q.questionText.toLowerCase().includes(search.toLowerCase()) ||
      q.type.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = () => {
    if (selectedIds.length === 0) return;

    startTransition(async () => {
      try {
        await addQuestionsToBank(bankId, selectedIds);
        toast.success(`${selectedIds.length} question(s) added successfully`);
        onRefresh?.();
        router.refresh();
        onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to add questions", {
          description: err.message || "An unexpected error occurred",
        });
      }
    });
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <Modal open={open} onClose={onClose} className="max-w-4xl flex flex-col max-h-[85vh]">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-primary">Add Questions to Bank</h2>
          <p className="text-sm text-inkd mt-1">Select questions to include in this bank.</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-inkd" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by text or type..."
            className="pl-9 w-full rounded-lg border-border focus:ring-pm"
          />
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto pr-2 min-h-75">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-inkd" />
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-inkd pt-12">
            <p>No questions found.</p>
            {questions.length === 0 && <p className="text-sm mt-1">All available questions are already in this bank.</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredQuestions.map((q) => {
              const isSelected = selectedIds.includes(q.id);
              return (
                <div
                  key={q.id}
                  onClick={() => toggleSelection(q.id)}
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
                    <p className="font-semibold text-primary line-clamp-2 leading-snug">{q.questionText}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                      <span className="rounded bg-white border px-2 py-0.5">{q.type.replace(/_/g, " ")}</span>
                      <span className="rounded bg-white border px-2 py-0.5 capitalize">{q.difficulty.toLowerCase()}</span>
                      <span className="rounded bg-white border px-2 py-0.5">{q.points} pts</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <div className="text-sm font-medium text-slate-600">
          {selectedIds.length} question{selectedIds.length !== 1 && "s"} selected
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedIds.length === 0 || isPending}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Selected
          </Button>
        </div>
      </div>
    </Modal>
  );
}
