"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import QuestionDetailsCard from "@/src/components/content/question-form/QuestionDetailsCard";
import QuestionPreviewCard from "@/src/components/content/question-form/QuestionPreviewCard";
import QuestionTypeSettingsCard from "@/src/components/content/question-form/QuestionTypeSettingsCard";
import type { QuestionFormData, QuestionFormType } from "@/src/types/question-form.types";
import type { QuestionBank } from "@/src/types/api";
import type { Topic } from "@/src/types/topic.types";
import { createQuestionAction } from "@/src/lib/actions/question.actions";
import { Button } from "@/src/components/ui/ui/button";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/ui/card";
import { getDefaultOptionsAndAnswers, mapToApiPayload } from "@/src/utils/question-form-utils";
import QuestionDuplicateHeader from "./QuestionDuplicateHeader";

const duplicateFormId = "question-duplicate-form";

export default function QuestionDuplicateForm({
  originalQuestionId,
  banks,
  topics,
  initialFormData,
}: {
  originalQuestionId: string;
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
    const topicToUse = formData.ownerTopicId || topics[0]?.id;
    
    if (!topicToUse) {
      toast.error("Validation failed", { description: "Cannot duplicate question: missing topic ID." });
      return;
    }
    
    startTransition(async () => {
      try {
        const payload = mapToApiPayload(formData);
        const res = await createQuestionAction(topicToUse, payload as any);
        if (res.success) {
          toast.success("Question duplicated successfully");
          router.refresh();          router.push("/questions");
        } else {
          toast.error("Failed to duplicate question", { description: res.error });
        }
      } catch (err: any) {
        const errorMsg = err.message || "Failed to duplicate question";
        toast.error("Validation failed", { description: errorMsg });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <QuestionDuplicateHeader formId={duplicateFormId} isPending={isPending} />
      </div>

      <form id={duplicateFormId} onSubmit={handleSubmit} className="space-y-6">
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
              <QuestionPreviewCard banks={banks} topics={topics} formData={formData} />
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
