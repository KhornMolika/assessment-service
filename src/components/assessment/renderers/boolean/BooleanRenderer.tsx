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
    <div className="grid gap-3 sm:grid-cols-2">
      {booleanOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = value === option.value;
        return (
          <Button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`group flex items-center gap-4 rounded-2xl border-2 px-5 py-5 text-left transition-all duration-200 ${
              isSelected
                ? "border-primary bg-primary/5 shadow-[0_0_0_3px_rgba(var(--color-primary),0.12)]"
                : "border-border bg-white hover:border-primary/30 hover:bg-primary/[0.02]"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <span
              className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isSelected
                  ? "bg-primary text-white"
                  : "bg-muted text-primary group-hover:bg-primary/10"
              }`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-primary">{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
