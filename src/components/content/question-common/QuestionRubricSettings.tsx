"use client";

import type { QuestionFormData } from "@/src/types/question-form.types";
import { getDefaultAiGradingInstruction } from "@/src/utils/question-ai-grading";
import QuestionRubricField from "./QuestionRubricField";
import { Button } from "@/src/components/ui/ui/button";

export default function QuestionRubricSettings({
  formData,
  onChange,
}: {
  formData: QuestionFormData;
  onChange: <K extends keyof QuestionFormData>(
    field: K,
    value: QuestionFormData[K],
  ) => void;
}) {
  const defaultInstruction = getDefaultAiGradingInstruction(formData.questionType);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          onClick={() => onChange("aiGradingMode", "default")}
          className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
            formData.aiGradingMode === "default"
              ? "border-acc bg-accp text-primary"
              : "border-border bg-card text-inkd hover:border-acc"
          }`}
        >
          Use Default Template
        </Button>
        <Button
          type="button"
          onClick={() => onChange("aiGradingMode", "custom")}
          className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
            formData.aiGradingMode === "custom"
              ? "border-acc bg-accp text-primary"
              : "border-border bg-card text-inkd hover:border-acc"
          }`}
        >
          Customize Instructions
        </Button>
      </div>

      {formData.aiGradingMode === "default" ? (
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
          <p className="text-sm font-semibold text-primary">Default AI grading prompt</p>
          <p className="mt-2 text-sm leading-6 text-inkd">{defaultInstruction}</p>
        </div>
      ) : (
        <QuestionRubricField formData={formData} onChange={onChange} />
      )}
    </div>
  );
}
