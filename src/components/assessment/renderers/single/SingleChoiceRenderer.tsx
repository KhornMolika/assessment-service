import { QuestionOptionButton } from "../../session/SessionShared";
import type { QuestionRendererProps } from "../types";

export function SingleChoiceRenderer({
  question,
  value,
  disabled,
  onChange,
}: QuestionRendererProps) {
  return (
    <div className={`grid w-full gap-3 ${question.options.length === 4 ? 'sm:grid-cols-2' : ''}`}>
      {question.options.map((option: { id: string; label: string; text: string }) => (
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
