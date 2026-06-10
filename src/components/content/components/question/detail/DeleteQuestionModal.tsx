"use client";

import { useRouter } from "next/navigation";
import type { QuestionDetailData } from "@/src/types/question-detail.types";
import { Button } from "@/src/components/ui/ui/button";
import { Modal } from "@/src/components/ui/ui/modal";

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

  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="mb-6 text-2xl font-bold text-primary">Delete Question</h3>
      <div className="space-y-6">
        <p className="text-sm text-inkd">
          Are you sure you want to delete this question? This question is currently used in <span className="font-bold text-primary">{question.stats.usedInAssessments} assessments</span>. Deleting it may affect those assessments. This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-4">
          <Button onClick={onClose} variant="secondary">Cancel</Button>
          <Button onClick={() => router.push('/questions')} variant="destructive">Delete Question</Button>
        </div>
      </div>
    </Modal>
  );
}
