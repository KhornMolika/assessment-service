import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import type { QuestionRendererProps } from "../types";

export function OrderingRenderer({
  question,
  value,
  disabled,
  onChange,
}: QuestionRendererProps) {
  const orderedIds =
    Array.isArray(value) && value.length === question.options.length
      ? value
      : [...question.options].reverse().map((option) => option.id);

  const orderedOptions = orderedIds
    .map((optionId) => question.options.find((option) => option.id === optionId))
    .filter((option): option is NonNullable<typeof option> => Boolean(option));

  function moveOption(fromIndex: number, toIndex: number) {
    if (disabled || toIndex < 0 || toIndex >= orderedIds.length) {
      return;
    }

    const nextIds = [...orderedIds];
    const [movedId] = nextIds.splice(fromIndex, 1);

    if (!movedId) {
      return;
    }

    nextIds.splice(toIndex, 0, movedId);
    onChange(nextIds);
  }

  return (
    <div className="rounded-[28px] border border-border bg-muted/20 p-5">
      <p className="text-sm leading-6 text-inkd">
        Move the options until they match the order you want to submit. Use the arrows to shift
        each item up or down in the sequence.
      </p>
      <div className="mt-4 space-y-3">
        {orderedOptions.map((option, index) => (
          <div
            key={option.id}
            className={`grid gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-sm sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center ${
              disabled ? "opacity-70" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-muted/40 p-2 text-primary/60">
                <GripVertical className="h-4 w-4" />
              </div>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {index + 1}
              </span>
            </div>
            <span className="text-sm font-semibold leading-6 text-primary">{option.text}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={disabled || index === 0}
                onClick={() => moveOption(index, index - 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-primary transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`Move ${option.text} up`}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={disabled || index === orderedOptions.length - 1}
                onClick={() => moveOption(index, index + 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-primary transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`Move ${option.text} down`}
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
