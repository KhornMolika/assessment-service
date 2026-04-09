"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/ui/card";
import type { QuestionFormData } from "@/src/domains/content/types/question-form.types";

function ToggleRow({
  title,
  description,
  checked,
  onToggle,
}: {
  title: string;
  description: string;
  checked: boolean;
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
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-acc" : "bg-gray-300"
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
          description="Use guided scoring suggestions for open responses."
          checked={formData.aiScoring}
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

