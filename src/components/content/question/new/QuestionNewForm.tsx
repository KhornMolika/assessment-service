"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import type { Bank } from "@/src/types/bank.types";
import type { Topic } from "@/src/types/topic.types";
import QuestionRubricSettings from "@/src/components/content/question-common/QuestionRubricSettings";
import QuestionDetailsCard from "@/src/components/content/question-form/QuestionDetailsCard";
import QuestionPreviewCard from "@/src/components/content/question-form/QuestionPreviewCard";
import QuestionTypeSettingsCard from "@/src/components/content/question-form/QuestionTypeSettingsCard";
import { questionFormSchema } from "@/src/schemas/question-form.schema";
import type { QuestionFormData } from "@/src/types/question-form.types";
import {
  supportsAiGradingInstructions,
  syncAiGradingFormState,
} from "@/src/utils/question-ai-grading";
import { createQuestionAction } from "@/src/lib/actions/question.actions";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import QuestionNewHeader from "./QuestionNewHeader";

const createFormId = "question-new-form";

const initialFormData: QuestionFormData = {
  questionText: "",
  questionType: "Single Choice",
  bank: "",
  ownerTopicId: "",
  topicIds: [],
  points: "1",
  difficulty: "Easy",
  language: "English (EN)",
  tags: "",
  explanation: "",
  mediaUrl: "",
  options: ["", "", "", ""],
  correctAnswers: [0],
  trueFalseAnswer: true,
  shortAnswerKeywords: [""],
  fillInBlankText: "",
  fillInBlankAnswers: [""],
  matchingPairs: [
    { left: "", right: "" },
    { left: "", right: "" },
    { left: "", right: "" },
  ],
  orderItems: ["", "", ""],
  ratingScale: 5,
  ratingLabels: { min: "Poor", max: "Excellent" },
  fileUploadTypes: ["pdf", "doc", "docx"],
  fileUploadMaxSize: 10,
  fileUploadMaxFiles: 1,
  fileUploadInstructions: "",
  aiScoring: false,
  aiGradingMode: "default",
  manualModeration: false,
  rubric: "",
};

export default function QuestionNewForm({
  banks,
  topics,
}: {
  banks: Bank[];
  topics: Topic[];
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<QuestionFormData>(() => syncAiGradingFormState(initialFormData));
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

      return syncAiGradingFormState(next);
    });
    setValidationErrors([]);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationResult = questionFormSchema.safeParse(formData);

    if (!validationResult.success) {
      const uniqueMessages = Array.from(
        new Set(validationResult.error.issues.map((issue) => issue.message)),
      );
      setValidationErrors(uniqueMessages);
      return;
    }

    setValidationErrors([]);
    
    startTransition(async () => {
      const res = await createQuestionAction(formData.ownerTopicId, formData);
      if (!res.success) {
        setValidationErrors([res.error || "Failed to create question"]);
      } else {
        router.push("/questions");
      }
    });
  };

  const showAiGradingInstructions = formData.aiScoring && supportsAiGradingInstructions(formData.questionType);

  return (
    <div className="space-y-6">
      <QuestionNewHeader formId={createFormId} />

      <form id={createFormId} onSubmit={handleSubmit} className="space-y-6">
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <QuestionDetailsCard
              banks={banks}
              topics={topics}
              formData={formData}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-6">
            <QuestionTypeSettingsCard
              formData={formData}
              onChange={handleChange}
              extraContent={
                showAiGradingInstructions ? (
                  <div className="space-y-3 border-t border-border pt-6">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-primary">AI Grading Instructions</h3>
                      <p className="text-sm text-inkd">
                        Start with a default template, then customize it when this question needs more specific grading guidance.
                      </p>
                    </div>
                    <QuestionRubricSettings formData={formData} onChange={handleChange} />
                  </div>
                ) : null
              }
            />
            <QuestionPreviewCard banks={banks} topics={topics} formData={formData} />
          </div>
        </div>
        </fieldset>
      </form>
    </div>
  );
}

