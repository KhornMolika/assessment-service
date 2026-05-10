import { BooleanRenderer } from "./boolean/BooleanRenderer";
import { EssayRenderer } from "./essay/EssayRenderer";
import { FileUploadRenderer } from "./file/FileUploadRenderer";
import { FillInTheBlankRenderer } from "./fill/FillInTheBlankRenderer";
import { MatchingRenderer } from "./matching/MatchingRenderer";
import { MultipleChoiceRenderer } from "./multiple/MultipleChoiceRenderer";
import { OrderingRenderer } from "./ordering/OrderingRenderer";
import { RatingRenderer } from "./rating/RatingRenderer";
import { ShortAnswerRenderer } from "./short/ShortAnswerRenderer";
import { SingleChoiceRenderer } from "./single/SingleChoiceRenderer";
import type { QuestionRendererProps } from "./types";
import { normalizeQuestionRendererType } from "../session/session.utils";

export function QuestionRenderer(props: QuestionRendererProps) {
  switch (normalizeQuestionRendererType(props.question.type)) {
    case "multiple":
      return <MultipleChoiceRenderer {...props} />;
    case "boolean":
      return <BooleanRenderer {...props} />;
    case "short":
      return <ShortAnswerRenderer {...props} />;
    case "essay":
      return <EssayRenderer {...props} />;
    case "rating":
      return <RatingRenderer {...props} />;
    case "ordering":
      return <OrderingRenderer {...props} />;
    case "fill":
      return <FillInTheBlankRenderer {...props} />;
    case "matching":
      return <MatchingRenderer {...props} />;
    case "file":
      return <FileUploadRenderer {...props} />;
    default:
      return <SingleChoiceRenderer {...props} />;
  }
}
