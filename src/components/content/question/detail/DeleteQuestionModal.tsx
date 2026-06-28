"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteQuestion } from "@/src/actions/question-actions";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ApiQuestionResponse } from "@/src/types/question-detail.types";
import DeleteConfirmModal from "@/src/components/ui/modals/DeleteConfirmModal";

export default function DeleteQuestionModal({
  open,
  question,
  onClose,
  onDeleted,
}: {
  open: boolean;
  question: { id: string; questionText: string } | null;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    if (!question) return;
    
    startTransition(async () => {
      try {
        await deleteQuestion(question.id);
        toast.success("Question deleted successfully");
        if (onDeleted) {
          onDeleted();
        } else {
          onClose();
          router.refresh();          router.push("/questions");
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toast.error("Failed to delete question", {
          description: error.message || "An unexpected error occurred",
        });
        console.error(error);
      }
    });
  };

  // Truncate long question texts for the UI
  const text = question?.questionText || "";
  const questionTitle = text.length > 50 
    ? text.substring(0, 50) + "..." 
    : text;

  if (!question) return null;

  return (
    <DeleteConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Delete Question"
      entityName={questionTitle}
      description=""
      isPending={isPending}
    />
  );
}
