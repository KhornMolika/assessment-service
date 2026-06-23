"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ApiQuestionResponse } from "@/src/types/question-detail.types";
import { Button } from "@/src/components/ui/ui/button";
import { Modal } from "@/src/components/ui/ui/modal";

export default function DeleteQuestionModal({
  open,
  question,
  onClose,
}: {
  open: boolean;
  question: ApiQuestionResponse;
  onClose: () => void;
}) {
  const router = useRouter();
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleClose = () => {
    setDeleteConfirmText("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <h3 className="mb-6 text-2xl font-bold text-primary">Delete Question</h3>
      <div className="space-y-6">
        <p className="text-sm text-inkd">
          Are you sure you want to delete this question? This action cannot be undone.
        </p>

        <div>
          <label className="mb-2 block text-sm font-medium text-inkd">
            Please type <strong>delete</strong> to confirm:
          </label>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Type 'delete'"
          />
        </div>
        <div className="flex items-center justify-end gap-4">
          <Button onClick={handleClose} variant="secondary">Cancel</Button>
          <Button 
            onClick={() => router.push('/questions')} 
            variant="destructive"
            disabled={deleteConfirmText.toLowerCase() !== "delete"}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Question
          </Button>
        </div>
      </div>
    </Modal>
  );
}
