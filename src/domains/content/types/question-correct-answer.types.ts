export type CorrectAnswer =
  | {
      type: "single";
      correct_option_ids: string[];
    }
  | {
      type: "multiple";
      correct_option_ids: string[];
    }
  | {
      type: "boolean";
      value: boolean;
    }
  | {
      type: "fill";
      answers: string[];
    }
  | {
      type: "ordering";
      correct_order: string[];
    }
  | {
      type: "matching";
      pairs: { left: string; right: string }[];
    }
  | {
      type: "essay";
      value: null;
    };


    // not include short_answer, rating, file_upload