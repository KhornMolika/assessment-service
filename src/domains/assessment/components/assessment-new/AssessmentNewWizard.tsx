"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Bank, QuestionCatalogItem } from "@/src/domains/content/types";
import type {
  AssessmentGradeLabel,
  NewAssessmentFormData,
} from "@/src/domains/assessment/types/assessment-form.types";
import AssessmentBasicInfoStep from "./AssessmentBasicInfoStep";
import AssessmentNewHeader from "./AssessmentNewHeader";
import AssessmentSettingsStep from "./AssessmentSettingsStep";
import AssessmentSummaryCard from "./AssessmentSummaryCard";
import AssessmentWizardRail from "./AssessmentWizardRail";

const defaultFormData: NewAssessmentFormData = {
  titleEN: "",
  titleKH: "",
  descriptionEN: "",
  descriptionKH: "",
  status: "DRAFT",
  participantIdentity: "REGISTERED",
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

const stepMeta = {
  1: {
    eyebrow: "Step 1",
    title: "Assessment Basics",
    helper: "Start with metadata",
    cta: "Continue to Session Strategy",
  },
  2: {
    eyebrow: "Step 2",
    title: "Session Strategy",
    helper: "Choose delivery approach",
    cta: "Continue to Question Configuration",
  },
  3: {
    eyebrow: "Step 3",
    title: "Question Configuration",
    helper: "Select and tune question sets",
    cta: "Continue to Timing and Rules",
  },
  4: {
    eyebrow: "Step 4",
    title: "Timing and Participant Rules",
    helper: "Finalize release settings",
    cta: "Publish Assessment",
  },
} as const;

export default function AssessmentNewWizard({
  banks,
  questions,
  mode = "create",
  assessmentId,
  initialFormData,
}: {
  banks: Bank[];
  questions: QuestionCatalogItem[];
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
  const [visitedSteps, setVisitedSteps] = useState<number[]>([1]);
  const [activeLanguageTab, setActiveLanguageTab] = useState<"en" | "kh">("en");
  const [questionSearch, setQuestionSearch] = useState("");
  const [formData, setFormData] = useState<NewAssessmentFormData>(
    initialFormData ?? defaultFormData,
  );

  const selectedBankQuestionCount = useMemo(() => {
    if (!formData.selectedBankId) {
      return questions.length;
    }

    return questions.filter((question) => question.bank_id === formData.selectedBankId).length;
  }, [formData.selectedBankId, questions]);

  const isStepComplete = (step: number) => {
    if (step === 1) {
      return formData.titleEN.trim().length > 0 || formData.titleKH.trim().length > 0;
    }

    if (step === 2) {
      return Boolean(formData.sessionMode) && Boolean(formData.questionSelection);
    }

    if (step === 3) {
      if (formData.questionSelection === "MANUAL") {
        return formData.selectedQuestionIds.length > 0;
      }

      const totalRuleCount = formData.selectionRules.reduce((sum, rule) => sum + rule.count, 0);
      return Boolean(formData.selectedBankId) && formData.totalQuestions > 0 && totalRuleCount > 0;
    }

    return formData.passMark >= 0;
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
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step as 1 | 2 | 3 | 4);
    setVisitedSteps((current) => (current.includes(step) ? current : [...current, step]));
  };

  const handleNext = () => {
    if (currentStep < 4 && canContinue) {
      handleStepChange((currentStep + 1) as 1 | 2 | 3 | 4);
    }
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
    console.log(mode === "edit" ? "Saving assessment changes:" : "Saving assessment draft:", formData);
    router.push(destination);
  };

  const handlePublish = () => {
    console.log(mode === "edit" ? "Publishing assessment changes:" : "Publishing assessment:", formData);
    router.push(destination);
  };

  const currentMeta = stepMeta[currentStep];
  const headerTitle = mode === "edit" ? `Edit ${formData.titleEN || "Assessment"}` : "Create New Assessment";
  const headerDescription =
    mode === "edit"
      ? "Update assessment settings, question strategy, and participant rules."
      : "Configure delivery, choose questions, and shape participant experience before launch.";

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6 lg:px-8">
      <AssessmentNewHeader title={headerTitle} description={headerDescription} />

      {/* <div className="rounded-4xl border border-border/70 bg-[linear-gradient(180deg,#f8fbf9_0%,#f1f6f3_100%)] shadow-sm sm:p-4 ">
        
      </div> */}

      <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-[1.75rem] border border-emerald-200/80 bg-white/90 p-3 shadow-sm backdrop-blur sm:p-4">
              <AssessmentWizardRail
                currentStep={currentStep}
                visitedSteps={visitedSteps}
                isStepComplete={isStepComplete}
                onStepChange={handleStepChange}
              />
            </div>

            <div className="rounded-[1.75rem] border border-emerald-200/80 bg-white/90 p-3 shadow-sm backdrop-blur sm:p-4">
              <AssessmentSummaryCard formData={formData} banks={banks} questions={questions} />
            </div>
          </aside>

          <section className="min-w-0 rounded-[1.75rem] border border-border/80 bg-white shadow-sm xl:flex xl:h-[calc(100vh)] xl:flex-col">
            <div className="border-b border-border/70 px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    {currentMeta.eyebrow}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-primary">{currentMeta.title}</h2>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-white">
                    {currentStep}/4
                  </span>
                  {currentMeta.helper}
                </div>
              </div>
            </div>

            <div className="min-h-0 px-3 py-3 sm:px-4 sm:py-4 xl:flex-1 xl:overflow-y-auto">
              <form id={formId} onSubmit={handleSubmit} className="min-w-0">
                {currentStep === 1 ? (
                  <AssessmentBasicInfoStep
                    formData={formData}
                    activeLanguageTab={activeLanguageTab}
                    onLanguageTabChange={setActiveLanguageTab}
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
                      {currentMeta.cta}
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
        </div>
    </div>
  );
}
