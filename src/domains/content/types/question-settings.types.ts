export interface SingleChoiceSettings {
  type: "single";
  options: {
    id: string;
    text: string;
  }[];
  shuffle?: boolean;
}

export interface MultipleChoiceSettings {
  type: "multiple";
  options: {
    id: string;
    text: string;
  }[];
  min_select?: number;
  max_select?: number;
}

export interface BooleanSettings {
  type: "boolean";
  true_label?: string;
  false_label?: string;
}

export interface ShortAnswerSettings {
  type: "short";
  max_length?: number;
  case_sensitive?: boolean;
}

export interface EssaySettings {
  type: "essay";
  min_words?: number;
  max_words?: number;
}

export interface RatingSettings {
  type: "rating";
  scale_min: number;
  scale_max: number;
  step?: number;
}

export interface OrderingSettings {
  type: "ordering";
  items: {
    id: string;
    text: string;
  }[];
}

export interface FillSettings {
  type: "fill";
  template: string; // e.g. "Data must be ____"
  blanks: number;
}

export interface MatchingSettings {
  type: "matching";
  left: { id: string; text: string }[];
  right: { id: string; text: string }[];
}

export interface FileUploadSettings {
  type: "file";
  allowed_types: string[];
  max_size_mb: number;
}

export type QuestionSettings =
  | SingleChoiceSettings
  | MultipleChoiceSettings
  | BooleanSettings
  | ShortAnswerSettings
  | EssaySettings
  | RatingSettings
  | OrderingSettings
  | FillSettings
  | MatchingSettings
  | FileUploadSettings;