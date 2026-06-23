"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteQuestionBank } from "@/src/actions/bank-actions";
import type { QuestionBank } from "@/src/types/api";
import DeleteConfirmModal from "@/src/components/ui/modals/DeleteConfirmModal";

export default function DeleteBankModal({
  bank,
  open,
  onClose,
  onConfirm,
}: {
  bank: QuestionBank;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        await deleteQuestionBank(bank.id);
        toast.success("Question bank deleted successfully");
        onConfirm();
      } catch (error: any) {
        toast.error("Failed to delete bank", {
          description: error.message || "An unexpected error occurred",
        });
        console.error(error);
      }
    });
  };

  return (
    <DeleteConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Delete Bank"
      entityName={bank.name}
      description={
        <>
          This bank currently contains <span className="font-bold text-primary">{bank.questionCount || 0}</span> questions. Deleting it may affect linked authoring workflows.
        </>
      }
      isPending={isPending}
    />
  );
}
