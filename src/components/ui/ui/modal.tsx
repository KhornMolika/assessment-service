"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ className, open, onClose, children, ...props }, ref) => {
    if (!open) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          ref={ref}
          className={cn("w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl", className)}
          onClick={(event) => event.stopPropagation()}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);
Modal.displayName = "Modal";

export { Modal };
