import type { QuestionRendererProps } from "../types";

export function RatingRenderer({ value, disabled, onChange }: QuestionRendererProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-5">
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          disabled={disabled}
          onClick={() => onChange(score)}
          className={`rounded-2xl border px-4 py-5 text-center transition ${
            value === score
              ? "border-primary bg-[#D8F3DC] text-primary shadow-sm"
              : "border-border bg-white text-primary hover:border-primary/40"
          } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <p className="text-2xl font-bold">{score}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
            Rating
          </p>
        </button>
      ))}
    </div>
  );
}
