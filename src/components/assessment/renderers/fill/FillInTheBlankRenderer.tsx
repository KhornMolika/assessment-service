import { useMemo } from "react";
import type { QuestionRendererProps } from "../types";
import { Input } from "@/src/components/ui/ui/input";

function isBlankValue(value: QuestionRendererProps["value"]): value is Record<string, string> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function FillInTheBlankRenderer({ question, value, disabled, onChange }: QuestionRendererProps) {
  const blankValue = isBlankValue(value) ? value : {};
  const template = question.rawOptions?.template || "";

  // Extract blanks from template like "A [blank_1] is... a [blank_2] institution..."
  const parts = useMemo(() => {
    if (!template) return [];
    return template.split(/(\[blank_\d+\])/);
  }, [template]);

  const blankCount = parts.filter((p: string) => /^\[blank_\d+\]$/.test(p)).length;

  // If no template, fall back to simple inputs
  if (!template || blankCount === 0) {
    return (
      <div className="grid gap-3">
        {[0, 1].map((index) => (
          <Input
            key={index}
            type="text"
            disabled={disabled}
            value={blankValue[String(index)] ?? ""}
            onChange={(event) =>
              onChange({
                ...blankValue,
                [String(index)]: event.target.value,
              })
            }
            placeholder={`Blank ${index + 1}`}
            className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
          />
        ))}
      </div>
    );
  }

  let blankIndex = 0;
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <p className="text-sm leading-8 text-primary">
        {parts.map((part: string, i: number) => {
          if (/^\[blank_\d+\]$/.test(part)) {
            const currentIndex = blankIndex++;
            return (
              <Input
                key={i}
                type="text"
                disabled={disabled}
                value={blankValue[String(currentIndex)] ?? ""}
                onChange={(event) =>
                  onChange({
                    ...blankValue,
                    [String(currentIndex)]: event.target.value,
                  })
                }
                placeholder={`blank ${currentIndex + 1}`}
                className="mx-1 inline-block w-40 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 px-3 py-1 text-center text-sm font-semibold text-primary outline-none transition focus:border-primary focus:bg-white"
              />
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
    </div>
  );
}
