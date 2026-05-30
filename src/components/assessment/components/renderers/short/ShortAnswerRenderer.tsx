import type { QuestionRendererProps } from "../types";

export function ShortAnswerRenderer({ value, disabled, onChange }: QuestionRendererProps) {
  return (
    <textarea
      value={typeof value === "string" ? value : ""}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Write a short response"
      className="min-h-32 w-full rounded-[28px] border border-border bg-white px-4 py-4 text-sm text-primary outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
    />
  );
}
