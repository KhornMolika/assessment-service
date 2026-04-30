"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import type { Bank } from "@/src/domains/content/types/bank.types";
import type { Topic } from "@/src/domains/content/types/topic.types";
import { questionFormSchema } from "@/src/domains/content/schemas/question-form.schema";
import { supportsAiGradingInstructions, syncAiGradingFormState } from "@/src/domains/content/utils/question-ai-grading";
import type { QuestionFormData } from "@/src/domains/content/types/question-form.types";
import QuestionRubricCard from "@/src/domains/content/components/question-common/QuestionRubricCard";
import QuestionDetailsCard from "@/src/domains/content/components/question-form/QuestionDetailsCard";
import QuestionPreviewCard from "@/src/domains/content/components/question-form/QuestionPreviewCard";
import QuestionTypeSettingsCard from "@/src/domains/content/components/question-form/QuestionTypeSettingsCard";
import { StateMessage } from "@/src/shared/components/feedback/StateMessage";
import QuestionEditHeader from "./QuestionEditHeader";

const editFormId = "question-edit-form";

export default function QuestionEditForm({
  questionId,
  banks,
  topics,
  initialFormData,
}: {
  questionId: string;
  banks: Bank[];
  topics: Topic[];
  initialFormData: QuestionFormData;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<QuestionFormData>(() =>
    syncAiGradingFormState(initialFormData),
  );
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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
    setValidationErrors([]);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationResult = questionFormSchema.safeParse(formData);

    if (!validationResult.success) {
      setValidationErrors(
        Array.from(new Set(validationResult.error.issues.map((issue) => issue.message))),
      );
      return;
    }

    setValidationErrors([]);
    console.log("Updating question:", questionId, formData);
    router.push(`/questions/${questionId}`);
  };

  const showAiGradingInstructions =
    formData.aiScoring && supportsAiGradingInstructions(formData.questionType);

  return (
    <div className="space-y-6">
      <QuestionEditHeader formId={editFormId} />

      <form id={editFormId} onSubmit={handleSubmit} className="space-y-6">
        {validationErrors.length > 0 ? (
          <StateMessage
            tone="error"
            title="Please fix the question form"
            description={
              <div className="space-y-1">
                {validationErrors.map((message) => (
                  <div key={message}>{message}</div>
                ))}
              </div>
            }
          />
        ) : null}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="space-y-6">
            <QuestionDetailsCard
              banks={banks}
              topics={topics}
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
              topics={topics}
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

