"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/ui/card";
import type { QuestionFormData } from "@/src/domains/content/types/question-form.types";
import { supportsAiGradingInstructions } from "@/src/domains/content/utils/question-ai-grading";

function ToggleRow({
  title,
  description,
  checked,
  disabled = false,
  onToggle,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <h3 className="mb-1 text-sm font-bold text-primary">{title}</h3>
        <p className="text-sm text-inkd">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          disabled ? "cursor-not-allowed bg-gray-200" : checked ? "bg-acc" : "bg-gray-300"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function QuestionEvaluationSetupCard({
  formData,
  onChange,
}: {
  formData: QuestionFormData;
  onChange: <K extends keyof QuestionFormData>(
    field: K,
    value: QuestionFormData[K],
  ) => void;
}) {
  const supportsAiScoring = supportsAiGradingInstructions(formData.questionType);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluation Setup</CardTitle>
        <CardDescription>
          Decide whether reviewers or AI should support grading.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ToggleRow
          title="AI scoring assist"
          description={
            supportsAiScoring
              ? "Use a default AI grading template or customize the instructions for open responses."
              : "AI-assisted grading is available for Short Answer, Essay, and File Upload questions."
          }
          checked={formData.aiScoring}
          disabled={!supportsAiScoring}
          onToggle={() => onChange("aiScoring", !formData.aiScoring)}
        />
        <ToggleRow
          title="Manual moderation"
          description="Send flagged answers to a reviewer queue before release."
          checked={formData.manualModeration}
          onToggle={() => onChange("manualModeration", !formData.manualModeration)}
        />
      </CardContent>
    </Card>
  );
}
