"use client";

import { Upload } from "lucide-react";
import type { QuestionRendererProps } from "../types";

export function FileUploadRenderer({ value, disabled, onChange }: QuestionRendererProps) {
  return (
    <label
      className={`block rounded-[28px] border border-dashed border-border bg-muted/15 px-6 py-8 text-primary transition ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-primary/40"
      }`}
    >
      <input
        type="file"
        disabled={disabled}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          onChange(file?.name ?? null);
        }}
      />
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <Upload className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">
            {typeof value === "string" && value.trim().length > 0
              ? "Replace uploaded file"
              : "Upload supporting file"}
          </p>
          <p className="mt-1 text-xs text-inkd">
            Select a file from your device and attach it to this response.
          </p>
        </div>
        {typeof value === "string" && value.trim().length > 0 ? (
          <div className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-primary shadow-sm">
            Selected: {value}
          </div>
        ) : null}
      </div>
    </label>
  );
}
