"use client";

import type { QuestionFormData } from "@/src/domains/content/types/question-form.types";

export default function QuestionRubricField({
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
    <textarea
      value={formData.rubric}
      onChange={(event) => onChange("rubric", event.target.value)}
      placeholder="Describe what a strong response should include and how it should be evaluated."
      rows={6}
      className="w-full resize-none rounded-lg border border-border px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pm"
    />
  );
}

