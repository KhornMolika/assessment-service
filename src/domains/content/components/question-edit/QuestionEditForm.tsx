"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Bank } from "@/src/domains/content/types/bank.types";
import { supportsAiGradingInstructions, syncAiGradingFormState } from "@/src/domains/content/utils/question-ai-grading";
import type { QuestionFormData } from "@/src/domains/content/types/question-form.types";
import QuestionRubricCard from "@/src/domains/content/components/question-common/QuestionRubricCard";
import QuestionDetailsCard from "@/src/domains/content/components/question-form/QuestionDetailsCard";
import QuestionPreviewCard from "@/src/domains/content/components/question-form/QuestionPreviewCard";
import QuestionTypeSettingsCard from "@/src/domains/content/components/question-form/QuestionTypeSettingsCard";
import QuestionEditHeader from "./QuestionEditHeader";

const editFormId = "question-edit-form";

export default function QuestionEditForm({
  questionId,
  banks,
  initialFormData,
}: {
  questionId: string;
  banks: Bank[];
  initialFormData: QuestionFormData;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<QuestionFormData>(() =>
    syncAiGradingFormState(initialFormData),
  );

  const handleChange = <K extends keyof QuestionFormData>(
    field: K,
    value: QuestionFormData[K],
  ) => {
    setFormData((current) => {
      const next = {
        ...current,
        [field]: value,
      } as QuestionFormData;

      return syncAiGradingFormState(next);
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Updating question:", questionId, formData);
    router.push(`/questions/${questionId}`);
  };

  const showAiGradingInstructions =
    formData.aiScoring && supportsAiGradingInstructions(formData.questionType);

  return (
    <div className="space-y-6">
      <QuestionEditHeader questionId={questionId} formId={editFormId} />

      <form id={editFormId} onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="space-y-6">
            <QuestionDetailsCard
              banks={banks}
              formData={formData}
              onChange={handleChange}
              title="Question Content"
              description="Author the prompt, answer structure, and classification in one place."
            />
          </div>

          <div className="space-y-6">
            <QuestionTypeSettingsCard
              formData={formData}
              onChange={handleChange}
              title="Question Type Setup"
              description="Adjust the response structure and correct-answer rules for this question type."
            />
            <QuestionPreviewCard
              banks={banks}
              formData={formData}
              title="Answering Preview"
              description="A quick creator-facing preview of how the question will behave."
            />
            {showAiGradingInstructions ? (
              <QuestionRubricCard formData={formData} onChange={handleChange} />
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );
}
