"use client";

import { useRouter } from "next/navigation";
import type { QuestionDetailData } from "@/src/types/question-detail.types";

export default function DeleteQuestionModal({
  open,
  question,
  onClose,
}: {
  open: boolean;
  question: QuestionDetailData;
  onClose: () => void;
}) {
  const router = useRouter();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <h3 className="mb-6 text-2xl font-bold text-primary">Delete Question</h3>
        <div className="space-y-6">
          <p className="text-sm text-inkd">
            Are you sure you want to delete this question? This question is currently used in <span className="font-bold text-primary">{question.stats.usedInAssessments} assessments</span>. Deleting it may affect those assessments. This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-4">
            <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted">Cancel</button>
            <button onClick={() => router.push('/questions')} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600">Delete Question</button>
          </div>
        </div>
      </div>
    </div>
  );
}
