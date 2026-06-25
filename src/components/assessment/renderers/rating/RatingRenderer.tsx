import type { QuestionRendererProps } from "../types";
import { Button } from "@/src/components/ui/ui/button";

export function RatingRenderer({ question, value, disabled, onChange }: QuestionRendererProps) {
  const raw = question.rawOptions;
  const min = raw?.min ?? 1;
  const max = raw?.max ?? 5;
  const lowLabel = raw?.lowLabel || "";
  const highLabel = raw?.highLabel || "";
  const scores = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="space-y-3">
      {(lowLabel || highLabel) ? (
        <div className="flex items-center justify-between text-xs font-medium text-inkd">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      ) : null}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${scores.length}, minmax(0, 1fr))` }}>
        {scores.map((score) => (
          <Button
            key={score}
            type="button"
            disabled={disabled}
            onClick={() => onChange(score)}
            className={`rounded-2xl border-2 px-3 py-5 text-center transition-all duration-200 ${
              value === score
                ? "border-primary bg-primary/5 shadow-[0_0_0_3px_rgba(var(--color-primary),0.12)]"
                : "border-border bg-white text-primary hover:border-primary/30 hover:bg-primary/[0.02]"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <p className="text-2xl font-bold text-primary">{score}</p>
          </Button>
        ))}
      </div>
    </div>
  );
}
