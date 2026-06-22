"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Trash2 } from "lucide-react";
import { deleteBankAction } from "@/src/lib/actions/bank.actions";
import type { QuestionBank } from "@/src/types/api";
import { Button } from "@/src/components/ui/ui/button";
import { Modal } from "@/src/components/ui/ui/modal";

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
  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="mb-6 text-2xl font-bold text-primary">Delete Bank</h3>
      <div className="space-y-6">
        <p className="text-sm text-inkd">
          Are you sure you want to delete <span className="font-bold text-primary">{bank.name}</span>? This bank currently contains <span className="font-bold text-primary">{bank.questionCount || 0}</span> questions. Deleting it may affect linked authoring workflows. This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-4">
          <Button onClick={onClose} variant="secondary">Cancel</Button>
          <Button onClick={onConfirm} variant="destructive">Delete Bank</Button>
        </div>
      </div>
    </Modal>
  );
}
