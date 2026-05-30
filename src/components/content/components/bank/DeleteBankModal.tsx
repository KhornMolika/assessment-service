"use client";

import type { Bank } from "@/src/types";

export default function DeleteBankModal({
  open,
  bank,
  onClose,
  onConfirm,
}: {
  open: boolean;
  bank: Bank;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="mb-6 text-2xl font-bold text-primary">Delete Bank</h3>
        <div className="space-y-6">
          <p className="text-sm text-inkd">
            Are you sure you want to delete <span className="font-bold text-primary">{bank.name}</span>? This bank currently contains <span className="font-bold text-primary">{bank.question_count}</span> questions. Deleting it may affect linked authoring workflows. This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Delete Bank
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
