"use client";

import { useState } from "react";
import { Modal } from "@/src/components/ui/ui/modal";

export interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  entityName: string;
  description: React.ReactNode;
  confirmWord?: string;
  isPending?: boolean;
}

export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  entityName,
  description,
  confirmWord = "delete",
  isPending = false,
}: DeleteConfirmModalProps) {
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleClose = () => {
    setDeleteConfirmText("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <h3 className="mb-6 text-2xl font-bold font-serif text-primary">{title}</h3>
      <div className="space-y-6">
        <p className="text-sm text-inkd">
          Are you sure you want to delete <span className="font-bold text-primary">{entityName}</span>? {description} This action cannot be undone.
        </p>
        
        <div>
          <label className="mb-2 block text-sm font-semibold text-primary">
            Type <span className="font-bold text-red-500">{confirmWord}</span> to
            confirm
          </label>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={confirmWord}
            className="w-full rounded-lg border border-border px-4 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
          />
        </div>
        
        <div className="flex items-center justify-end gap-4 mt-8">
          <button 
            onClick={handleClose} 
            className="px-5 py-2.5 rounded-lg bg-[#F1EFE7] hover:bg-[#E5E3D8] text-slate-800 text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm();
              setDeleteConfirmText("");
            }} 
            disabled={deleteConfirmText !== confirmWord || isPending}
            className="px-5 py-2.5 rounded-lg bg-danger hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {title}
          </button>
        </div>
      </div>
    </Modal>
  );
}
