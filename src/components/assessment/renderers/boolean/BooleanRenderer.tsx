import { Check, X } from "lucide-react";
import type { QuestionRendererProps } from "../types";
import { Button } from "@/src/components/ui/ui/button";

export function BooleanRenderer({ question, value, disabled, onChange }: QuestionRendererProps) {
  const raw = question.rawOptions;
  const trueLabel = raw?.trueLabel || "True";
  const falseLabel = raw?.falseLabel || "False";

  const booleanOptions = [
    { id: "true", label: trueLabel, value: true, icon: Check },
    { id: "false", label: falseLabel, value: false, icon: X },
  ];

  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      {booleanOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.value;
        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`group relative flex items-center gap-5 rounded-2xl border-2 px-6 py-5 text-left transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 ${
              isSelected
                ? "border-primary bg-primary/3 shadow-md shadow-primary/10"
                : "border-border/60 bg-white hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white hover:shadow-lg hover:shadow-primary/5"
            } ${disabled ? "cursor-not-allowed opacity-60 hover:-translate-y-0 hover:shadow-none" : ""}`}
          >
            <span
              className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                isSelected
                  ? option.value ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-110" : "bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-110"
                  : "bg-muted text-primary group-hover:bg-primary/10 group-hover:text-primary"
              }`}
            >
              <Icon className="h-6 w-6" />
            </span>
            <span className={`text-base font-medium leading-relaxed transition-colors duration-300 ${
              isSelected ? "text-primary" : "text-inkd group-hover:text-primary"
            }`}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
