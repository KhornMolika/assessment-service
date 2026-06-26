import type { QuestionRendererProps } from "../types";
import { Textarea } from "@/src/components/ui/ui/textarea";

export function EssayRenderer({ question, value, disabled, onChange }: QuestionRendererProps) {
  const raw = question.rawOptions;
  const minWords = raw?.minWords;
  const maxWords = raw?.maxWords;
  const currentText = typeof value === "string" ? value : "";
  const wordCount = currentText.trim() ? currentText.trim().split(/\s+/).length : 0;

  return (
    <div className="flex h-full w-full flex-col space-y-2">
      <Textarea
        value={currentText}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write your essay response…"
        className="flex-1 w-full rounded-2xl border-2 border-border/60 bg-primary/[0.02] px-5 py-4 text-base leading-relaxed text-primary shadow-sm outline-none transition-all duration-300 placeholder:text-primary/30 hover:border-primary/40 hover:shadow-md focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
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
