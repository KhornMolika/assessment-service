"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Bank } from "@/src/domains/content/types/bank.types";
import type { Topic } from "@/src/domains/content/types/topic.types";
import QuestionRubricSettings from "@/src/domains/content/components/question-common/QuestionRubricSettings";
import QuestionDetailsCard from "@/src/domains/content/components/question-form/QuestionDetailsCard";
import QuestionPreviewCard from "@/src/domains/content/components/question-form/QuestionPreviewCard";
import QuestionTypeSettingsCard from "@/src/domains/content/components/question-form/QuestionTypeSettingsCard";
import type { QuestionFormData } from "@/src/domains/content/types/question-form.types";
import {
  supportsAiGradingInstructions,
  syncAiGradingFormState,
} from "@/src/domains/content/utils/question-ai-grading";
import QuestionNewHeader from "./QuestionNewHeader";

const createFormId = "question-new-form";

const initialFormData: QuestionFormData = {
  questionText: "",
  questionType: "Single Choice",
  bank: "",
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

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formData.topicIds.length === 0) {
      return;
    }

    console.log("Creating question:", formData);
    router.push("/questions");
  };

  const showAiGradingInstructions = formData.aiScoring && supportsAiGradingInstructions(formData.questionType);

  return (
    <div className="space-y-6">
      <QuestionNewHeader formId={createFormId} />

      <form id={createFormId} onSubmit={handleSubmit} className="space-y-6">
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
      </form>
    </div>
  );
}

