import type { QuestionRendererProps } from "../types";

export function FillInTheBlankRenderer({ value, disabled, onChange }: QuestionRendererProps) {
  return (
    <div className="grid gap-3">
      {[0, 1].map((index) => (
        <input
          key={index}
          type="text"
          disabled={disabled}
          value={typeof value === "object" && value !== null ? value[String(index)] ?? "" : ""}
          onChange={(event) =>
            onChange({
              ...(typeof value === "object" && value !== null ? value : {}),
              [String(index)]: event.target.value,
            })
          }
          placeholder={`Blank ${index + 1}`}
          className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
        />
      ))}
    </div>
  );
}
