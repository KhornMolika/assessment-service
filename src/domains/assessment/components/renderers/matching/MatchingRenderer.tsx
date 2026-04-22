import type { QuestionRendererProps } from "../types";

export function MatchingRenderer({ question, value, disabled, onChange }: QuestionRendererProps) {
  const midpoint = Math.ceil(question.options.length / 2);
  const leftOptions = question.options.slice(0, midpoint);
  const rightOptions = question.options.slice(midpoint);
  const selectedPairs = typeof value === "object" && value !== null ? value : {};

  return (
    <div className="space-y-3">
      <div className="rounded-[28px] border border-border bg-muted/20 p-5">
        <p className="text-sm leading-6 text-inkd">
          Match each item on the left with the best option on the right. Each selection is saved as
          part of the answer response.
        </p>
      </div>

      {leftOptions.map((option, index) => (
        <div
          key={option.id}
          className="grid gap-3 rounded-[28px] border border-border bg-muted/20 p-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center"
        >
          <div className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-primary">
            Prompt {index + 1}
          </div>
          <div className="text-center text-sm font-semibold text-primary/60">matches</div>
          <div className="space-y-3">
            <div className="rounded-2xl bg-white px-4 py-3 text-sm text-inkd">{option.text}</div>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                Select matching option
              </span>
              <select
                disabled={disabled}
                value={selectedPairs[option.id] ?? ""}
                onChange={(event) =>
                  onChange({
                    ...selectedPairs,
                    [option.id]: event.target.value,
                  })
                }
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">Choose a match</option>
                {rightOptions.map((rightOption) => (
                  <option key={rightOption.id} value={rightOption.id}>
                    {rightOption.text}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ))}

      <div className="rounded-[28px] border border-border bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
          Available right-side options
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {rightOptions.map((option) => (
            <div key={option.id} className="rounded-2xl border border-border bg-muted/15 px-4 py-3">
              <p className="text-sm font-semibold text-primary">{option.label}</p>
              <p className="mt-1 text-sm leading-6 text-inkd">{option.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
