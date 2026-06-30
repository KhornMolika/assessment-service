import { QuestionOptionButton } from "../../session/SessionShared";
import type { QuestionRendererProps } from "../types";

export function MultipleChoiceRenderer({
  question,
  value,
  disabled,
  onChange,
}: QuestionRendererProps) {
  const selectedIds = Array.isArray(value) ? value : [];

  function toggleOption(optionId: string) {
    if (selectedIds.includes(optionId)) {
      onChange(selectedIds.filter((id) => id !== optionId));
      return;
    }

    onChange([...selectedIds, optionId]);
  }

  return (
    <div className={`grid w-full gap-3 ${question.options.length === 4 ? 'sm:grid-cols-2' : ''}`}>
      {question.options.map((option: { id: string; label?: string; text: string }, index: number) => {
        const defaultLabel = String.fromCharCode(65 + index); // A, B, C, D...
        return (
          <QuestionOptionButton
            key={option.id}
            option={{ ...option, label: option.label || defaultLabel }}
            selected={selectedIds.includes(option.id)}
            disabled={disabled}
            onClick={() => toggleOption(option.id)}
          />
        );
      })}
    </div>
  );
}
