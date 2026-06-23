import type { QuestionRendererProps } from "../types";
import { Button } from "@/src/components/ui/ui/button";

const booleanOptions = [
  { id: "true", label: "True", value: true },
  { id: "false", label: "False", value: false },
];

export function BooleanRenderer({ value, disabled, onChange }: QuestionRendererProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {booleanOptions.map((option) => (
        <Button
          key={option.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={`rounded-2xl border px-4 py-4 text-left transition ${
            value === option.value
              ? "border-primary bg-[#D8F3DC] text-primary shadow-sm"
              : "border-border bg-white text-primary hover:border-primary/40"
          } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
            Boolean
          </p>
          <p className="mt-2 text-base font-semibold">{option.label}</p>
        </Button>
      ))}
    </div>
  );
}
