"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import type { QuestionBank } from "@/src/types/api";
import type { Topic } from "@/src/types/topic.types";
import { questionFormSchema } from "@/src/schemas/question-form.schema";
import type { QuestionFormData, QuestionFormType } from "@/src/types/question-form.types";
import QuestionDetailsCard from "@/src/components/content/question-form/QuestionDetailsCard";
import QuestionPreviewCard from "@/src/components/content/question-form/QuestionPreviewCard";
import QuestionTypeSettingsCard from "@/src/components/content/question-form/QuestionTypeSettingsCard";
import { updateQuestionAction } from "@/src/lib/actions/question.actions";
import { toast } from "sonner";
import QuestionEditHeader from "./QuestionEditHeader";
import { getDefaultOptionsAndAnswers, mapToApiPayload } from "@/src/utils/question-form-utils";

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
  const [isPending, startTransition] = useTransition();

  const handleChange = <K extends keyof QuestionFormData>(
    field: K,
    value: QuestionFormData[K],
  ) => {
    setFormData((current) => {
      let next = { ...current, [field]: value } as QuestionFormData;
      
      if (field === "questionType") {
        const defaults = getDefaultOptionsAndAnswers(value as QuestionFormType);
        next.options = defaults.options;
        next.correctAnswers = defaults.correctAnswers;
      }
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationResult = questionFormSchema.safeParse(formData);

    if (!validationResult.success) {
      const issues = Array.from(new Set(validationResult.error.issues.map((issue) => issue.message)));
      toast.error("Validation failed", { description: issues.join("\n") });
      return;
    }
    
    startTransition(async () => {
      try {
        const payload = mapToApiPayload(formData, true);
        const res = await updateQuestionAction(questionId, payload);
        if (!res.success) {
          toast.error("Failed to update question", { description: res.error });
        } else {
          toast.success("Question updated successfully");
          router.push(`/questions/${questionId}`);
        }
      } catch (err: any) {
        toast.error("Validation failed", { description: err.message || "Failed to update question" });
      }
    });
  };

  return (
    <div className="space-y-6">
      <QuestionEditHeader formId={editFormId} />

      <form id={editFormId} onSubmit={handleSubmit} className="space-y-6">
        <fieldset disabled={isPending} className="space-y-6">

        <div className="space-y-6 flex flex-col">
          <div className="relative z-20">
            <QuestionDetailsCard
              banks={banks}
              topics={topics}
              formData={formData}
              onChange={handleChange}
              title="Question Content"
              description="Author the prompt, answer structure, and classification in one place."
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 relative z-10">
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

