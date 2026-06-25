import type { QuestionRendererProps } from "../types";
import { Label } from "@/src/components/ui/ui/label";
import { Select } from "@/src/components/ui/ui/select";

function isMatchingValue(value: QuestionRendererProps["value"]): value is Record<string, string> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function MatchingRenderer({ question, value, disabled, onChange }: QuestionRendererProps) {
  const raw = question.rawOptions;
  const leftOptions = raw?.leftSide || [];
  const rightOptions = raw?.rightSide || [];
  const selectedPairs = isMatchingValue(value) ? value : {};

  // Count how many pairs are matched
  const matchedCount = Object.values(selectedPairs).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/20 px-5 py-3">
        <p className="text-sm text-inkd">
          Match each term on the left with the correct definition on the right.
        </p>
        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {matchedCount}/{leftOptions.length} matched
        </span>
      </div>

      <div className="space-y-3">
        {leftOptions.map((option: any, index: number) => {
          const isMatched = !!selectedPairs[option.id];
          return (
            <div
              key={option.id}
              className={`rounded-2xl border-2 bg-white p-4 transition-all duration-200 ${
                isMatched ? "border-primary/30 shadow-sm" : "border-border"
              }`}
            >
              <div className="flex items-start gap-4">
                <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                  isMatched ? "bg-primary text-white" : "bg-muted text-primary"
                }`}>
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-3">
                  <p className="text-sm font-semibold text-primary">{option.text}</p>
                  <Label className="block">
                    <Select
                      disabled={disabled}
                      value={selectedPairs[option.id] ?? ""}
                      onChange={(event) =>
                        onChange({
                          ...selectedPairs,
                          [option.id]: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-border bg-muted/10 px-4 py-2.5 text-sm text-primary outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">Select a match…</option>
                      {rightOptions.map((rightOption: any) => (
                        <option key={rightOption.id} value={rightOption.id}>
                          {rightOption.text}
                        </option>
                      ))}
                    </Select>
                  </Label>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
