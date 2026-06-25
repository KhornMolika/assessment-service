import type { QuestionRendererProps } from "../types";
import { Textarea } from "@/src/components/ui/ui/textarea";

export function ShortAnswerRenderer({ question, value, disabled, onChange }: QuestionRendererProps) {
  const raw = question.rawOptions;
  const minWords = raw?.minWords;
  const maxWords = raw?.maxWords;
  const currentText = typeof value === "string" ? value : "";
  const wordCount = currentText.trim() ? currentText.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-2">
      <Textarea
        value={currentText}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write a short response…"
        className="min-h-32 w-full rounded-2xl border-2 border-border bg-white px-5 py-4 text-sm leading-7 text-primary outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
      />
      {(minWords || maxWords) ? (
        <div className="flex items-center justify-between px-1 text-xs text-inkd">
          <span>{wordCount} word{wordCount !== 1 ? "s" : ""}</span>
          <span>
            {minWords && maxWords ? `${minWords}–${maxWords} words` : maxWords ? `Max ${maxWords} words` : `Min ${minWords} words`}
          </span>
        </div>
      ) : null}
    </div>
  );
}
