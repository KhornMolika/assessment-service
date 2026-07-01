import { useMemo } from "react";
import type { QuestionRendererProps } from "../types";
import { Input } from "@/src/components/ui/ui/input";

function isBlankValue(value: QuestionRendererProps["value"]): value is Record<string, string> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function FillInTheBlankRenderer({ question, value, disabled, onChange }: QuestionRendererProps) {
  const blankValue = isBlankValue(value) ? value : {};
  const questionText = question.question || question.questionText || "";
  const template = question.rawOptions?.template || questionText;

  // Extract blanks from template like "A [blank_1] is..." or "A {{blank1}} is..."
  const parts = useMemo(() => {
    if (!template) return [];
    return template.split(/(\[blank_\d+\]|\{\{blank\d+\}\})/i);
  }, [template]);

  const blankCount = parts.filter((p: string) => /^\[blank_\d+\]$/i.test(p) || /^\{\{blank\d+\}\}$/i.test(p)).length;

  // If no template or blanks found, fall back to simple inputs based on expected answers if available, otherwise just 1
  if (!template || blankCount === 0) {
    const fallbackCount = Array.isArray(question.correctAnswers?.answers) 
      ? question.correctAnswers.answers.length 
      : 1;
      
    return (
      <div className="grid gap-3">
        {Array.from({ length: Math.max(1, fallbackCount) }).map((_, index) => (
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
    <div className="flex flex-1 flex-col w-full rounded-[24px] border border-border/60 bg-white/70 p-6 shadow-sm backdrop-blur-sm sm:p-8">
      <p className="text-base text-primary sm:text-lg leading-[2.5rem] sm:leading-[3rem]">
        {parts.map((part: string, i: number) => {
          if (/^\[blank_\d+\]$/i.test(part) || /^\{\{blank\d+\}\}$/i.test(part)) {
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
                className="mx-2 inline-flex h-10 w-40 items-center justify-center rounded-xl border-b-2 border-l-0 border-r-0 border-t-0 border-border/80 bg-primary/[0.02] px-3 text-center text-base font-bold text-primary shadow-inner outline-none transition-all duration-300 placeholder:text-primary/20 hover:border-primary/40 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/20"
              />
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
    </div>
  );
}
