"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/ui/card";
import type { QuestionFormData } from "@/src/domains/content/types/question-form.types";
import QuestionRubricField from "./QuestionRubricField";

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
          Add instructions to guide AI-assisted scoring for open response questions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <QuestionRubricField formData={formData} onChange={onChange} />
      </CardContent>
    </Card>
  );
}

