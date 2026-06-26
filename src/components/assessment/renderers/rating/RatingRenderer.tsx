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
    <div className="w-full space-y-3">
      {(lowLabel || highLabel) ? (
        <div className="flex items-center justify-between text-xs font-medium text-inkd">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      ) : null}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${scores.length}, minmax(0, 1fr))` }}>
        {scores.map((score) => (
          <button
            key={score}
            type="button"
            disabled={disabled}
            onClick={() => onChange(score)}
            className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 px-3 py-6 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 ${
              value === score
                ? "border-amber-400 bg-amber-50 shadow-md shadow-amber-500/20 scale-105"
                : "border-border/60 bg-white hover:-translate-y-1 hover:border-amber-300 hover:bg-amber-50/50 hover:shadow-lg hover:shadow-amber-500/10"
            } ${disabled ? "cursor-not-allowed opacity-50 hover:-translate-y-0 hover:scale-100 hover:shadow-none" : ""}`}
          >
            <p className={`text-2xl font-black transition-colors duration-300 ${
              value === score ? "text-amber-600" : "text-primary/70 group-hover:text-amber-500"
            }`}>
              {score}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
