"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import type { QuestionBank } from "@/src/types/api";
import type { Topic } from "@/src/types/topic.types";
import { questionFormSchema } from "@/src/schemas/question-form.schema";
import type { QuestionFormData } from "@/src/types/question-form.types";
import QuestionDetailsCard from "@/src/components/content/question-form/QuestionDetailsCard";
import QuestionPreviewCard from "@/src/components/content/question-form/QuestionPreviewCard";
import QuestionTypeSettingsCard from "@/src/components/content/question-form/QuestionTypeSettingsCard";
import { updateQuestionAction } from "@/src/lib/actions/question.actions";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import QuestionEditHeader from "./QuestionEditHeader";

const editFormId = "question-edit-form";

export default function QuestionEditForm({
  questionId,
  banks,
  topics,
  initialFormData,
}: {
  questionId: string;
  banks: QuestionBank[];
  topics: Topic[];
  initialFormData: QuestionFormData;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<QuestionFormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = <K extends keyof QuestionFormData>(
    field: K,
    value: QuestionFormData[K],
  ) => {
    setFormData((current) => {
      const next = {
        ...current,
        [field]: value,
      } as QuestionFormData;

      return next;
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
    
    startTransition(async () => {
      const res = await updateQuestionAction(questionId, formData);
      if (!res.success) {
        setValidationErrors([res.error || "Failed to update question"]);
      } else {
        router.push(`/questions/${questionId}`);
      }
    });
  };

  return (
    <div className="space-y-6">
      <QuestionEditHeader formId={editFormId} />

      <form id={editFormId} onSubmit={handleSubmit} className="space-y-6">
        <fieldset disabled={isPending} className="space-y-6">
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
            />
            <QuestionPreviewCard
              banks={banks}
              topics={topics}
              formData={formData}
            />
          </div>
        </div>
        </fieldset>
      </form>
    </div>
  );
}

