import type { QuestionRendererProps } from "../types";
import { Textarea } from "@/src/components/ui/ui/textarea";

export function EssayRenderer({ value, disabled, onChange }: QuestionRendererProps) {
  return (
    <Textarea
      value={typeof value === "string" ? value : ""}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Write your essay response"
      className="min-h-48 w-full rounded-[28px] border border-border bg-white px-4 py-4 text-sm text-primary outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
    />
  );
}
