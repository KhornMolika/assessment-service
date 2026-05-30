import type { QuestionRound } from "../session/session.types";

export type QuestionRendererValue =
  | string
  | string[]
  | boolean
  | number
  | Record<string, string>
  | null;

export interface QuestionRendererProps {
  question: QuestionRound;
  value: QuestionRendererValue;
  disabled?: boolean;
  readOnly?: boolean;
  onChange: (value: QuestionRendererValue) => void;
}
