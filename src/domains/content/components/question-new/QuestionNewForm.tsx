"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Bank } from "@/src/domains/content/types/bank.types";
import QuestionRubricField from "@/src/domains/content/components/question-common/QuestionRubricField";
import QuestionDetailsCard from "@/src/domains/content/components/question-form/QuestionDetailsCard";
import QuestionPreviewCard from "@/src/domains/content/components/question-form/QuestionPreviewCard";
import QuestionTypeSettingsCard from "@/src/domains/content/components/question-form/QuestionTypeSettingsCard";
import type { QuestionFormData } from "@/src/domains/content/types/question-form.types";
import { supportsAiGradingInstructions } from "@/src/domains/content/utils/question-ai-grading";
import QuestionNewHeader from "./QuestionNewHeader";

const createFormId = "question-new-form";

const initialFormData: QuestionFormData = {
  questionText: "",
  questionType: "Single Choice",
  bank: "",
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
  manualModeration: false,
  rubric: "",
};

export default function QuestionNewForm({ banks }: { banks: Bank[] }) {
  const router = useRouter();
  const [formData, setFormData] = useState<QuestionFormData>(initialFormData);

  const handleChange = <K extends keyof QuestionFormData>(
    field: K,
    value: QuestionFormData[K],
  ) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Creating question:", formData);
    router.push("/questions");
  };

  const showAiGradingInstructions = supportsAiGradingInstructions(formData.questionType);

  return (
    <div className="space-y-6">
      <QuestionNewHeader formId={createFormId} />

      <form id={createFormId} onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <QuestionDetailsCard banks={banks} formData={formData} onChange={handleChange} />
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
                        Add instructions to guide AI-assisted scoring for open response questions.
                      </p>
                    </div>
                    <QuestionRubricField formData={formData} onChange={handleChange} />
                  </div>
                ) : null
              }
            />
            <QuestionPreviewCard banks={banks} formData={formData} />
          </div>
        </div>
      </form>
    </div>
  );
}


