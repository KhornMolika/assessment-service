"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { QuestionBank, Question } from "@/src/types/api";
import type { Topic } from "@/src/types/topic.types";
import { assessmentFormSchema } from "@/src/schemas/assessment-form.schema";
import type {
  AssessmentGradeLabel,
  NewAssessmentFormData,
} from "@/src/types/assessment-form.types";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import AssessmentBasicInfoStep from "./AssessmentBasicInfoStep";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import AssessmentSettingsStep from "./AssessmentSettingsStep";
import AssessmentQuestionStep from "./AssessmentQuestionStep";
import AssessmentSummaryCard from "./AssessmentSummaryCard";
import { createAssessmentAction, updateAssessmentAction, publishAssessmentAction } from "@/src/lib/actions/assessment.actions";
import { Button } from "@/src/components/ui/ui/button";
import { toast } from "sonner";

import { useTopicStore } from "@/src/stores/topic-store";

const defaultFormData: NewAssessmentFormData = {
  name: "",
  type: "QUIZ",
  description: "",
  ownerTopicId: "",
  status: "DRAFT",
  participantIdentity: "EXTERNAL",
  sessionMode: "SELF_PACED",
  questionSelection: "MANUAL",
  selectedBankId: "",
  selectedQuestionIds: [],
  totalQuestions: 10,
  selectionRules: [
    { difficulty: "Easy", count: 3 },
    { difficulty: "Medium", count: 5 },
    { difficulty: "Hard", count: 2 },
  ],
  enableTimeLimit: false,
  timeLimitMinutes: 0,
  startsAt: "",
  endsAt: "",
  passMark: 50,
  shuffleQuestions: true,
  gradeLabels: [
    { grade: "A", minPercent: 90 },
    { grade: "B", minPercent: 80 },
    { grade: "C", minPercent: 70 },
    { grade: "D", minPercent: 60 },
    { grade: "F", minPercent: 0 },
  ],
  showResults: "IMMEDIATELY",
};

const stepValidationFields: Record<1 | 2 | 3, string[]> = {
  1: ["name"],
  2: [
    "sessionMode",
    "questionSelection",
    "participantIdentity",
    "timeLimitMinutes",
    "startsAt",
    "endsAt",
    "passMark",
    "gradeLabels",
    "showResults",
  ],
  3: [
    "selectedBankId",
    "selectedQuestionIds",
    "totalQuestions",
    "selectionRules",
  ],
};

export default function AssessmentForm({
  banks,
  questions,
  topics,
  mode = "create",
  assessmentId,
  initialFormData,
}: {
  banks: QuestionBank[];
  questions: Question[];
  topics: Topic[];
  mode?: "create" | "edit" | "duplicate";
  assessmentId?: string;
  initialFormData?: NewAssessmentFormData;
}) {
  const router = useRouter();
  const activeTopic = useTopicStore((s) => s.activeTopic);
  
  const formId =
    mode === "edit" && assessmentId
      ? `assessment-edit-form-${assessmentId}`
      : mode === "duplicate"
        ? "assessment-duplicate-form"
        : "assessment-new-form";
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [questionSearch, setQuestionSearch] = useState("");
  const [formData, setFormData] = useState<NewAssessmentFormData>(
    initialFormData ?? { ...defaultFormData, ownerTopicId: activeTopic?.id || "" },
  );
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const getStepValidationMessages = (step: 1 | 2 | 3) => {
    const dataToValidate = {
      ...formData,
      ownerTopicId: activeTopic?.id || formData.ownerTopicId || "TEMP_TOPIC" // satisfy schema for missing topic since we handle it externally
    };
    const validationResult = assessmentFormSchema.safeParse(dataToValidate);

    if (validationResult.success) {
      return [];
    }

    const allowedFields = stepValidationFields[step];

    return Array.from(
      new Set(
        validationResult.error.issues
          .filter((issue) =>
            allowedFields.includes(String(issue.path[0] ?? "")),
          )
          .map((issue) => issue.message),
      ),
    );
  };

  const isStepComplete = (step: number) => {
    if (![1, 2, 3].includes(step)) {
      return false;
    }

    return getStepValidationMessages(step as 1 | 2 | 3).length === 0;
  };

  const canContinue = isStepComplete(currentStep);

  const handleChange = <K extends keyof NewAssessmentFormData>(
    field: K,
    value: NewAssessmentFormData[K],
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
    setValidationErrors([]);
  };

  const handleNext = () => {
    if (currentStep >= 4) {
      return;
    }

    if (!canContinue) {
      setValidationErrors(getStepValidationMessages(currentStep));
      return;
    }

    setValidationErrors([]);
    setCurrentStep((currentStep + 1) as 1 | 2 | 3);
  };

  const handlePrevious = () => {
    if (currentStep <= 1) {
      return;
    }

    setValidationErrors([]);
    setCurrentStep((currentStep - 1) as 1 | 2 | 3);
  };

  const handleQuestionToggle = (questionId: string) => {
    setFormData((current) => {
      const alreadySelected = current.selectedQuestionIds.includes(questionId);

      return {
        ...current,
        selectedQuestionIds: alreadySelected
          ? current.selectedQuestionIds.filter((id) => id !== questionId)
          : [...current.selectedQuestionIds, questionId],
      };
    });
  };

  const handleSelectionRuleChange = (
    difficulty: "Easy" | "Medium" | "Hard",
    count: number,
  ) => {
    setFormData((current) => ({
      ...current,
      selectionRules: current.selectionRules.map((rule) =>
        rule.difficulty === difficulty ? { ...rule, count } : rule,
      ),
    }));
  };

  const handleGradeLabelChange = (
    index: number,
    field: keyof AssessmentGradeLabel,
    value: string | number,
  ) => {
    setFormData((current) => ({
      ...current,
      gradeLabels: current.gradeLabels.map((label, currentIndex) =>
        currentIndex === index ? { ...label, [field]: value } : label,
      ),
    }));
  };

  const handleAddGradeLabel = () => {
    setFormData((current) => ({
      ...current,
      gradeLabels: [...current.gradeLabels, { grade: "", minPercent: 0 }],
    }));
  };

  const handleRemoveGradeLabel = (index: number) => {
    setFormData((current) => ({
      ...current,
      gradeLabels: current.gradeLabels.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
    }));
  };

  const destination =
    mode === "edit" && assessmentId
      ? `/assessments/${assessmentId}`
      : "/assessments";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode !== "edit" && !activeTopic) return;
    
    const submitData = {
      ...formData,
      ownerTopicId: activeTopic?.id || formData.ownerTopicId
    };
    
    const validationResult = assessmentFormSchema.safeParse(submitData);

    if (!validationResult.success) {
      setValidationErrors(
        Array.from(
          new Set(validationResult.error.issues.map((issue) => issue.message)),
        ),
      );
      return;
    }

    setValidationErrors([]);
    
    startTransition(async () => {
      let res;
      if (mode === "edit" && assessmentId) {
        res = await updateAssessmentAction(assessmentId, submitData);
      } else {
        res = await createAssessmentAction(submitData.ownerTopicId, submitData);
      }
      
      if (!res.success) {
        setValidationErrors([res.error || "Failed to save assessment"]);
        toast.error(res.error || "Failed to save assessment");
      } else {
        toast.success(mode === "edit" ? "Assessment updated successfully!" : "Assessment created successfully!");
        router.push(destination);
      }
    });
  };

  const handlePublish = () => {
    if (mode !== "edit" && !activeTopic) return;
    
    const submitData = {
      ...formData,
      ownerTopicId: activeTopic?.id || formData.ownerTopicId
    };
    
    const validationResult = assessmentFormSchema.safeParse(submitData);

    if (!validationResult.success) {
      setValidationErrors(
        Array.from(
          new Set(validationResult.error.issues.map((issue) => issue.message)),
        ),
      );
      return;
    }

    setValidationErrors([]);
    
    startTransition(async () => {
      let currentAssessmentId = assessmentId;
      
      // If creating new or duplicating and publishing immediately
      if (mode !== "edit" || !currentAssessmentId) {
        const createRes = await createAssessmentAction(submitData.ownerTopicId, submitData);
        if (!createRes.success || !createRes.assessment) {
          setValidationErrors([createRes.error || "Failed to create assessment for publishing"]);
          return;
        }
        currentAssessmentId = (createRes.assessment as any).data?.id || createRes.assessment.id;
      } else {
        // If editing existing, save draft first
        const updateRes = await updateAssessmentAction(currentAssessmentId, submitData);
        if (!updateRes.success) {
          setValidationErrors([updateRes.error || "Failed to save assessment before publishing"]);
          return;
        }
      }
      
      // Now publish
      if (!currentAssessmentId) return;
      const publishRes = await publishAssessmentAction(currentAssessmentId);
      if (!publishRes.success) {
        setValidationErrors([publishRes.error || "Failed to publish assessment"]);
        toast.error(publishRes.error || "Failed to publish assessment");
      } else {
        toast.success("Assessment published successfully!");
        router.push(destination);
      }
    });
  };

  const headerTitle =
    mode === "edit"
      ? `Edit ${formData.name || "Assessment"}`
      : mode === "duplicate"
        ? `Duplicate ${formData.name || "Assessment"}`
        : "Create New Assessment";
  const headerDescription =
    mode === "edit"
      ? "Update assessment settings, question strategy, and participant rules."
      : "Configure delivery, choose questions, and shape participant experience before launch.";

  return (
    <div className="w-full space-y-6">
      <PageHeaderCard
        title={headerTitle}
        description={headerDescription}
        backHref={destination}
        backLabel={mode === "edit" ? "Back" : "Cancel"}
      />

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 rounded-2xl border border-border/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] shadow-sm">
          <div className="border-b border-border/70 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-[#14352b]">
                  {mode === "edit"
                    ? "Assessment Setup"
                    : "Build Your Assessment"}
                </h2>
                <p className="text-sm text-inkd">
                  {mode === "edit" && formData.status !== "DRAFT" 
                    ? "This assessment is no longer a draft and cannot be edited." 
                    : "Complete the current section before moving forward."}
                </p>
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Step {currentStep} of 3
              </div>
            </div>
          </div>

          <div className="px-3 py-3 sm:px-4 sm:py-4">
            {mode !== "edit" && !activeTopic && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-md">
                <div className="flex">
                  <div className="shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      You must select a global Topic from the topbar before creating a new assessment.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {mode === "edit" && formData.status !== "DRAFT" && (
              <div className="mb-6">
                <StateMessage
                  tone="warning"
                  title="Editing Disabled"
                  description="This assessment has been published or archived. Its configuration and questions are locked to preserve participant records."
                />
              </div>
            )}
            <form id={formId} onSubmit={handleSubmit} className="min-w-0">
              <fieldset disabled={isPending || (mode === "edit" && formData.status !== "DRAFT") || (mode !== "edit" && !activeTopic)}>
              {validationErrors.length > 0 ? (
                <div className="mb-4">
                  <StateMessage
                    tone="error"
                    title="Please fix the assessment form"
                    description={
                      <div className="space-y-1">
                        {validationErrors.map((message) => (
                          <div key={message}>{message}</div>
                        ))}
                      </div>
                    }
                  />
                </div>
              ) : null}

              {currentStep === 1 ? (
                <AssessmentBasicInfoStep
                  formData={formData}
                  topics={topics}
                  onChange={handleChange}
                />
              ) : currentStep === 2 ? (
                <AssessmentSettingsStep
                  formData={formData}
                  onChange={handleChange}
                  onGradeLabelChange={handleGradeLabelChange}
                  onAddGradeLabel={handleAddGradeLabel}
                  onRemoveGradeLabel={handleRemoveGradeLabel}
                />
              ) : (
                <AssessmentQuestionStep
                  formData={formData}
                  banks={banks}
                  questions={questions}
                  questionSearch={questionSearch}
                  onQuestionSearchChange={setQuestionSearch}
                  onChange={handleChange}
                  onQuestionToggle={handleQuestionToggle}
                  onSelectionRuleChange={handleSelectionRuleChange}
                />
              )}
              </fieldset>
            </form>
          </div>

          <div className="border-t border-border/70 bg-slate-50/80 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`inline-flex w-full items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition sm:w-auto ${
                  currentStep === 1
                    ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                    : "border-[#e6e2d6] bg-[#fdfbf7] text-[#4a473e] hover:bg-[#f2efe6]"
                }`}
              >
                Previous
              </Button>
              <div className="sm:min-w-52">
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canContinue}
                    className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      canContinue
                        ? "bg-[#14352b] text-[#fdfbf7] hover:bg-[#1a4436] shadow-sm"
                        : "cursor-not-allowed bg-slate-100 text-slate-400"
                    }`}
                  >
                    Continue
                  </Button>
                ) : mode === "edit" && formData.status !== "DRAFT" ? (
                  <Button
                    type="button"
                    disabled
                    className="inline-flex w-full items-center justify-center rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-400 transition cursor-not-allowed"
                  >
                    Editing Locked
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handlePublish}
                    disabled={isPending}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-[#d95d50] px-4 py-3 text-sm font-semibold text-[#fdfbf7] transition hover:bg-[#c95347] shadow-sm disabled:opacity-70" variant="ghost"
                  >
                    {isPending ? "Saving..." : (mode === "edit" ? "Save Changes" : "Save Assessment")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4 2xl:sticky 2xl:top-6 2xl:self-start">
          <div className="rounded-[1.75rem] border border-emerald-200/80 bg-white/90 p-3 shadow-sm backdrop-blur sm:p-4">
            <AssessmentSummaryCard
              formData={formData}
              banks={banks}
              questions={questions}
              topics={topics}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
