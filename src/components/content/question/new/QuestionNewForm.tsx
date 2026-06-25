"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import QuestionDetailsCard from "@/src/components/content/question-form/QuestionDetailsCard";
import QuestionPreviewCard from "@/src/components/content/question-form/QuestionPreviewCard";
import QuestionTypeSettingsCard from "@/src/components/content/question-form/QuestionTypeSettingsCard";
import type { QuestionFormData, QuestionFormType } from "@/src/types/question-form.types";
import { createQuestion } from "@/src/actions/question-actions";
import QuestionNewHeader from "./QuestionNewHeader";
import { Button } from "@/src/components/ui/ui/button";
import { toast } from "sonner";
import { getDefaultOptionsAndAnswers, mapToApiPayload } from "@/src/utils/question-form-utils";
import { useTopicStore } from "@/src/stores/topic-store";

const createFormId = "question-new-form";


const initialDefaults = getDefaultOptionsAndAnswers("Single Choice");

const initialFormData: QuestionFormData = {
  questionText: "",
  questionType: "Single Choice",
  bank: "",
  ownerTopicId: "",
  points: "1",
  difficulty: "Easy",
  options: initialDefaults.options,
  correctAnswers: initialDefaults.correctAnswers,
};


export default function QuestionNewForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<QuestionFormData>(initialFormData);
  const [isPending, startTransition] = useTransition();
  const activeTopic = useTopicStore((s) => s.activeTopic);

  const handleChange = <K extends keyof QuestionFormData>(
    field: K,
    value: QuestionFormData[K],
  ) => {
    setFormData((current) => {
      let next = { ...current, [field]: value } as QuestionFormData;
      
      // Reset options and answers if type changes
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
    if (!activeTopic) return;
    
    startTransition(async () => {
      try {
        const payload = mapToApiPayload(formData);
        await createQuestion(activeTopic.id, payload as any);
        toast.success("Question created successfully");
        router.refresh();        router.push("/questions");
      } catch (err: any) {
        const errorMsg = err.message || "Failed to create question";
        toast.error("Validation failed", {
          description: errorMsg
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <QuestionNewHeader 
          formId={createFormId} 
          disabled={!activeTopic} 
          isPending={isPending} 
        />
      </div>

      {!activeTopic && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You must select a global Topic from the topbar before creating a question.
              </p>
            </div>
          </div>
        </div>
      )}

      <form id={createFormId} onSubmit={handleSubmit} className="space-y-6">
        <fieldset disabled={isPending || !activeTopic} className="space-y-6">

        <div className="space-y-6 flex flex-col">
          <div className="relative z-20">
            <QuestionDetailsCard
              banks={[]}
              topics={[]}
              formData={formData}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 relative z-10">
            <QuestionTypeSettingsCard
              formData={formData}
              onChange={handleChange}
            />
            <QuestionPreviewCard banks={[]} topics={[]} formData={formData} />
          </div>
        </div>
        </fieldset>
      </form>
    </div>
  );
}
