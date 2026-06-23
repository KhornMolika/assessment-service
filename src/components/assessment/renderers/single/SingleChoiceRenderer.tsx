import { QuestionOptionButton } from "../../session/SessionShared";
import type { QuestionRendererProps } from "../types";

export function SingleChoiceRenderer({
  question,
  value,
  disabled,
  onChange,
}: QuestionRendererProps) {
  return (
    <div className="grid gap-3">
      {question.options.map((option) => (
        <QuestionOptionButton
          key={option.id}
          option={option}
          selected={value === option.id}
          disabled={disabled}
          onClick={() => onChange(option.id)}
        />
      ))}
    </div>
  );
}
