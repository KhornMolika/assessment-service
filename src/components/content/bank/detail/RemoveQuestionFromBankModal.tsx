"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { removeQuestionFromBank } from "@/src/actions/bank-actions";
import type { Question } from "@/src/types/api";
import DeleteConfirmModal from "@/src/components/ui/modals/DeleteConfirmModal";

export default function RemoveQuestionFromBankModal({
  open,
  onClose,
  bankId,
  question,
  onRefresh,
}: {
  open: boolean;
  onClose: () => void;
  bankId: string;
  question: Question | null;
  onRefresh?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!question) return null;

  const handleRemove = () => {
    startTransition(async () => {
      try {
        await removeQuestionFromBank(bankId, question.id);
        toast.success("Question removed from bank");
        onRefresh?.();
        router.refresh();
        onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        toast.error("Failed to remove question", {
          description: err.message || "An unexpected error occurred",
        });
        console.error(err);
      }
    });
  };

  const questionTitle = question.questionText.length > 50 
    ? question.questionText.substring(0, 50) + "..." 
    : question.questionText;

  return (
    <DeleteConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={handleRemove}
      title="Remove Question"
      entityName={questionTitle}
      description="This will not delete the question itself, only unlink it from this bank."
      confirmWord="remove"
      isPending={isPending}
    />
  );
}
