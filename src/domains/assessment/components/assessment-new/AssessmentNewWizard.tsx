"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Bank, QuestionCatalogItem } from "@/src/domains/content/types";
import type { Topic } from "@/src/domains/content/types/topic.types";
import { assessmentFormSchema } from "@/src/domains/assessment/schemas/assessment-form.schema";
import type {
  AssessmentGradeLabel,
  NewAssessmentFormData,
} from "@/src/domains/assessment/types/assessment-form.types";
import { StateMessage } from "@/src/shared/components/feedback/StateMessage";
import AssessmentBasicInfoStep from "./AssessmentBasicInfoStep";
import AssessmentNewHeader from "./AssessmentNewHeader";
import AssessmentSettingsStep from "./AssessmentSettingsStep";
import AssessmentSummaryCard from "./AssessmentSummaryCard";
import AssessmentWizardRail from "./AssessmentWizardRail";

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
  3: ["selectedBankId", "selectedQuestionIds", "totalQuestions", "selectionRules"],
  4: ["timeLimitMinutes", "startsAt", "endsAt", "passMark", "gradeLabels", "showResults"],
};

export default function AssessmentNewWizard({
  banks,
  questions,
  topics,
  mode = "create",
  assessmentId,
  initialFormData,
}: {
  banks: Bank[];
  questions: QuestionCatalogItem[];
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

  const selectedBankQuestionCount = useMemo(() => {
    if (!formData.selectedBankId) {
      return questions.length;
    }

    return questions.filter((question) => question.bank_id === formData.selectedBankId).length;
  }, [formData.selectedBankId, questions]);

  const getStepValidationMessages = (step: 1 | 2 | 3 | 4) => {
    const validationResult = assessmentFormSchema.safeParse(formData);

    if (validationResult.success) {
      return [];
    }

    const allowedFields = stepValidationFields[step];

    return Array.from(
      new Set(
        validationResult.error.issues
          .filter((issue) => allowedFields.includes(String(issue.path[0] ?? "")))
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

  const canNavigateToStep = (step: number) => {
    if (![1, 2, 3, 4].includes(step)) {
      return false;
    }

    if (step <= currentStep) {
      return true;
    }

    if (step !== currentStep + 1) {
      return false;
    }

    return isStepComplete(currentStep);
  };

  const handleStepChange = (step: number) => {
    if (!canNavigateToStep(step)) {
      const blockingStep = ([1, 2, 3, 4] as const).find(
        (candidate) => candidate < step && !isStepComplete(candidate),
      );

      if (blockingStep) {
        setValidationErrors(getStepValidationMessages(blockingStep));
      }
      return;
    }

    setValidationErrors([]);
    setCurrentStep(step as 1 | 2 | 3 | 4);
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
    handleStepChange((currentStep + 1) as 1 | 2 | 3 | 4);
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
      gradeLabels: current.gradeLabels.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const destination = mode === "edit" && assessmentId ? `/assessments/${assessmentId}` : "/assessments";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationResult = assessmentFormSchema.safeParse(formData);

    if (!validationResult.success) {
      setValidationErrors(
        Array.from(new Set(validationResult.error.issues.map((issue) => issue.message))),
      );
      return;
    }

    setValidationErrors([]);
    console.log(mode === "edit" ? "Saving assessment changes:" : "Saving assessment draft:", formData);
    router.push(destination);
  };

  const handlePublish = () => {
    const validationResult = assessmentFormSchema.safeParse(formData);

    if (!validationResult.success) {
      setValidationErrors(
        Array.from(new Set(validationResult.error.issues.map((issue) => issue.message))),
      );
      return;
    }

    setValidationErrors([]);
    console.log(mode === "edit" ? "Publishing assessment changes:" : "Publishing assessment:", formData);
    router.push(destination);
  };

  const headerTitle = mode === "edit" ? `Edit ${formData.title || "Assessment"}` : "Create New Assessment";
  const headerDescription =
    mode === "edit"
      ? "Update assessment settings, question strategy, and participant rules."
      : "Configure delivery, choose questions, and shape participant experience before launch.";

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6 lg:px-8">
      <AssessmentNewHeader title={headerTitle} description={headerDescription} />

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-[1.75rem] border border-emerald-200/80 bg-white/90 p-3 shadow-sm backdrop-blur sm:p-4">
            <AssessmentWizardRail
              currentStep={currentStep}
              isStepComplete={isStepComplete}
              canNavigateToStep={canNavigateToStep}
              onStepChange={handleStepChange}
            />
          </div>
        </aside>

        <section className="min-w-0 rounded-[1.75rem] border border-border/80 bg-[linear-gradient(180deg,#ffffff_0%,#fbfdfc_100%)] shadow-sm">
          <div className="border-b border-border/70 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Step {currentStep} of 4
                </div>
                <h2 className="text-xl font-bold text-primary">
                  {mode === "edit" ? "Assessment Setup" : "Build Your Assessment"}
                </h2>
                <p className="text-sm text-inkd">
                  Complete the current section before moving forward.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 text-sm sm:w-fit">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700/80">
                    Current mode
                  </div>
                  <div className="mt-1 font-semibold text-primary">
                    {formData.sessionMode === "SELF_PACED" ? "Self-paced" : "Real-time"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700/80">
                    Question flow
                  </div>
                  <div className="mt-1 font-semibold text-primary">
                    {formData.questionSelection === "MANUAL" ? "Manual" : "Dynamic"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-3 py-3 sm:px-4 sm:py-4">
            <form id={formId} onSubmit={handleSubmit} className="min-w-0">
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
            </form>
          </div>

          <div className="border-t border-border/70 bg-slate-50/80 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="text-sm text-inkd">
                {currentStep === 3 && formData.questionSelection === "DYNAMIC"
                  ? `${selectedBankQuestionCount} available question${selectedBankQuestionCount === 1 ? "" : "s"} in the chosen bank.`
                  : currentStep === 3 && formData.questionSelection === "MANUAL"
                    ? `${formData.selectedQuestionIds.length} selected question${formData.selectedQuestionIds.length === 1 ? "" : "s"} ready for this assessment.`
                    : mode === "edit"
                      ? "Adjust the assessment in stages and keep the summary updated as you go."
                      : "Move through the setup one step at a time and keep the assessment summary in sync."}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:min-w-90 xl:max-w-130">
                <Link
                  href={destination}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
                >
                  {mode === "edit" ? "Back" : "Cancel"}
                </Link>

                {currentStep < 4 ? (
                  <button
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
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePublish}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-[#2D6A4F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#214b3d]"
                  >
                    {mode === "edit" ? "Save Changes" : "Publish Assessment"}
                  </button>
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
