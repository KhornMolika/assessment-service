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
import AssessmentNewHeader from "./AssessmentNewHeader";
import AssessmentSettingsStep from "./AssessmentSettingsStep";
import AssessmentSummaryCard from "./AssessmentSummaryCard";
import { createAssessmentAction, updateAssessmentAction, publishAssessmentAction } from "@/src/lib/actions/assessment.actions";
import { Button } from "@/src/components/ui/ui/button";
import { toast } from "sonner";

const defaultFormData: NewAssessmentFormData = {
  title: "",
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
  allowGoingBack: true,
  gradeLabels: [
    { grade: "A", minPercent: 90 },
    { grade: "B", minPercent: 80 },
    { grade: "C", minPercent: 70 },
    { grade: "D", minPercent: 60 },
    { grade: "F", minPercent: 0 },
  ],
  showResults: "IMMEDIATELY",
};

const stepValidationFields: Record<1 | 2 | 3 | 4, string[]> = {
  1: ["title", "ownerTopicId"],
  2: ["sessionMode", "questionSelection"],
  3: [
    "selectedBankId",
    "selectedQuestionIds",
    "totalQuestions",
    "selectionRules",
  ],
  4: [
    "timeLimitMinutes",
    "startsAt",
    "endsAt",
    "passMark",
    "gradeLabels",
    "showResults",
  ],
};

export default function AssessmentNewWizard({
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
  mode?: "create" | "edit";
  assessmentId?: string;
  initialFormData?: NewAssessmentFormData;
}) {
  const router = useRouter();
  const formId =
    mode === "edit" && assessmentId
      ? `assessment-edit-form-${assessmentId}`
      : "assessment-new-form";
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [questionSearch, setQuestionSearch] = useState("");
  const [formData, setFormData] = useState<NewAssessmentFormData>(
    initialFormData ?? defaultFormData,
  );
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const getStepValidationMessages = (step: 1 | 2 | 3 | 4) => {
    const validationResult = assessmentFormSchema.safeParse(formData);

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
    if (![1, 2, 3, 4].includes(step)) {
      return false;
    }

    return getStepValidationMessages(step as 1 | 2 | 3 | 4).length === 0;
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
    setCurrentStep((currentStep + 1) as 1 | 2 | 3 | 4);
  };

  const handlePrevious = () => {
    if (currentStep <= 1) {
      return;
    }

    setValidationErrors([]);
    setCurrentStep((currentStep - 1) as 1 | 2 | 3 | 4);
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
    const validationResult = assessmentFormSchema.safeParse(formData);

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
        res = await updateAssessmentAction(assessmentId, formData);
      } else {
        res = await createAssessmentAction(formData.ownerTopicId, formData);
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
    const validationResult = assessmentFormSchema.safeParse(formData);

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
      
      // If creating new and publishing immediately
      if (mode !== "edit" || !currentAssessmentId) {
        const createRes = await createAssessmentAction(formData.ownerTopicId, formData);
        if (!createRes.success || !createRes.assessment) {
          setValidationErrors([createRes.error || "Failed to create assessment for publishing"]);
          return;
        }
        currentAssessmentId = (createRes.assessment as any).data?.id || createRes.assessment.id;
      } else {
        // If editing existing, save draft first
        const updateRes = await updateAssessmentAction(currentAssessmentId, formData);
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
      ? `Edit ${formData.title || "Assessment"}`
      : "Create New Assessment";
  const headerDescription =
    mode === "edit"
      ? "Update assessment settings, question strategy, and participant rules."
      : "Configure delivery, choose questions, and shape participant experience before launch.";

  return (
    <div className="w-full space-y-6">
      <AssessmentNewHeader
        title={headerTitle}
        description={headerDescription}
        cancelHref={destination}
        cancelLabel={mode === "edit" ? "Back" : "Cancel"}
      />

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 rounded-[1.75rem] border border-border/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] shadow-sm">
          <div className="border-b border-border/70 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-primary">
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
                Step {currentStep} of 4
              </div>
            </div>
          </div>

          <div className="px-3 py-3 sm:px-4 sm:py-4">
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
              <fieldset disabled={isPending || (mode === "edit" && formData.status !== "DRAFT")}>
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
                  section="SESSION_STRATEGY"
                  formData={formData}
                  banks={banks}
                  questions={questions}
                  questionSearch={questionSearch}
                  onQuestionSearchChange={setQuestionSearch}
                  onChange={handleChange}
                  onQuestionToggle={handleQuestionToggle}
                  onSelectionRuleChange={handleSelectionRuleChange}
                  onGradeLabelChange={handleGradeLabelChange}
                  onAddGradeLabel={handleAddGradeLabel}
                  onRemoveGradeLabel={handleRemoveGradeLabel}
                />
              ) : currentStep === 3 ? (
                <AssessmentSettingsStep
                  section="QUESTION_CONFIGURATION"
                  formData={formData}
                  banks={banks}
                  questions={questions}
                  questionSearch={questionSearch}
                  onQuestionSearchChange={setQuestionSearch}
                  onChange={handleChange}
                  onQuestionToggle={handleQuestionToggle}
                  onSelectionRuleChange={handleSelectionRuleChange}
                  onGradeLabelChange={handleGradeLabelChange}
                  onAddGradeLabel={handleAddGradeLabel}
                  onRemoveGradeLabel={handleRemoveGradeLabel}
                />
              ) : (
                <AssessmentSettingsStep
                  section="TIMING_RULES"
                  formData={formData}
                  banks={banks}
                  questions={questions}
                  questionSearch={questionSearch}
                  onQuestionSearchChange={setQuestionSearch}
                  onChange={handleChange}
                  onQuestionToggle={handleQuestionToggle}
                  onSelectionRuleChange={handleSelectionRuleChange}
                  onGradeLabelChange={handleGradeLabelChange}
                  onAddGradeLabel={handleAddGradeLabel}
                  onRemoveGradeLabel={handleRemoveGradeLabel}
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
                    ? "cursor-not-allowed border-border bg-muted text-inkl"
                    : "border-border bg-white text-primary hover:bg-muted"
                }`}
              >
                Previous
              </Button>
              <div className="sm:min-w-52">
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canContinue}
                    className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      canContinue
                        ? "bg-primary text-white hover:bg-pm"
                        : "cursor-not-allowed bg-muted text-inkl"
                    }`}
                  >
                    Continue
                  </Button>
                ) : mode === "edit" && formData.status !== "DRAFT" ? (
                  <Button
                    type="button"
                    disabled
                    className="inline-flex w-full items-center justify-center rounded-xl bg-muted px-4 py-3 text-sm font-semibold text-inkl transition cursor-not-allowed"
                  >
                    Editing Locked
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handlePublish}
                    disabled={isPending}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-[#2D6A4F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#214b3d] disabled:opacity-70" variant="ghost"
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
