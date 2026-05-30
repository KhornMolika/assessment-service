import type { QuestionDetailData } from "@/src/types/question-detail.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/ui/card";
import QuestionTypePreview from "./QuestionTypePreview";

export default function QuestionPreviewCard({ question }: { question: QuestionDetailData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-xl bg-muted p-4 sm:p-6">
          <div className="mb-3 text-xs font-semibold uppercase text-inkd">Question</div>
          <p className="text-base font-semibold text-primary sm:text-lg">{question.question_text}</p>
        </div>

        <QuestionTypePreview question={question} />
      </CardContent>
    </Card>
  );
}
