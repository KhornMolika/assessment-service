"use client";

import { Modal } from "@/src/components/ui/ui/modal";
import { Button } from "@/src/components/ui/ui/button";

export interface ActionConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isPending?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export default function ActionConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isPending = false,
  variant = "default",
}: ActionConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="mb-6 font-serif text-2xl font-bold text-primary">{title}</h3>
      <div className="space-y-6">
        <p className="text-sm text-inkd">{description}</p>
        
        <div className="mt-8 flex items-center justify-end gap-4">
          <Button 
            onClick={onClose} 
            variant="secondary"
            disabled={isPending}
          >
            {cancelText}
          </Button>
          <Button 
            onClick={() => {
              onConfirm();
            }} 
            disabled={isPending}
            variant={variant}
          >
            {isPending ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
