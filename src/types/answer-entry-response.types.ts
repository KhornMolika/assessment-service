export interface SingleChoiceResponse {
  type: "single";
  selected_option_id: string;
}

export interface MultipleChoiceResponse {
  type: "multiple";
  selected_option_ids: string[];
}

export interface BooleanResponse {
  type: "boolean";
  value: boolean;
}

export interface ShortAnswerResponse {
  type: "short";
  text: string;
}

export interface EssayResponse {
  type: "essay";
  text: string;
}

export interface RatingResponse {
  type: "rating";
  value: number;
}

export interface OrderingResponse {
  type: "ordering";
  ordered_ids: string[];
}

export interface FillResponse {
  type: "fill";
  answers: string[];
}

export interface MatchingResponse {
  type: "matching";
  pairs: {
    left_id: string;
    right_id: string;
  }[];
}

export interface FileUploadResponse {
  type: "file";
  file_url: string;
}

export type QuestionResponse =
  | SingleChoiceResponse
  | MultipleChoiceResponse
  | BooleanResponse
  | ShortAnswerResponse
  | EssayResponse
  | RatingResponse
  | OrderingResponse
  | FillResponse
  | MatchingResponse
  | FileUploadResponse;
