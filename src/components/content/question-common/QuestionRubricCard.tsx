"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/ui/card";
import type { QuestionFormData } from "@/src/types/question-form.types";
import QuestionRubricSettings from "./QuestionRubricSettings";

export default function QuestionRubricCard({
  formData,
  onChange,
}: {
  formData: QuestionFormData;
  onChange: <K extends keyof QuestionFormData>(
    field: K,
    value: QuestionFormData[K],
  ) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Grading Instructions</CardTitle>
        <CardDescription>
          Start with a default template, then customize it when the grading criteria need more precision.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <QuestionRubricSettings formData={formData} onChange={onChange} />
      </CardContent>
    </Card>
  );
}
