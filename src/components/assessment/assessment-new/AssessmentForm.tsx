"use client";

import type { QuestionBank, Question } from "@/src/types/api";
import type { Topic } from "@/src/types/topic.types";
import type { NewAssessmentFormData } from "@/src/types/assessment-form.types";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import AssessmentBasicInfoStep from "./AssessmentBasicInfoStep";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import AssessmentSettingsStep from "./AssessmentSettingsStep";
import AssessmentQuestionStep from "./AssessmentQuestionStep";
import AssessmentSummaryCard from "./AssessmentSummaryCard";
import { Button } from "@/src/components/ui/ui/button";
import Link from "next/link";
import { useAssessmentForm } from "@/src/hooks/use-assessment-form";

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
  const {
    currentStep,
    questionSearch,
    setQuestionSearch,
    formData,
    validationErrors,
    isPending,
    canContinue,
    handleChange,
    handleNext,
    handlePrevious,
    handleQuestionToggle,
    handleSelectionRuleChange,
    handleGradeLabelChange,
    handleAddGradeLabel,
    handleRemoveGradeLabel,
    handleSubmit,
    handlePublish,
    destination,
    activeTopic
  } = useAssessmentForm({ mode, assessmentId, initialFormData });

  const formId =
    mode === "edit" && assessmentId
      ? `assessment-edit-form-${assessmentId}`
      : mode === "duplicate"
        ? "assessment-duplicate-form"
        : "assessment-new-form";

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
        actions={
          <Link
            href={destination}
            className="rounded-lg border border-border px-4 py-2 text-center text-sm font-semibold text-primary transition hover:bg-muted bg-white"
          >
            Cancel
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
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
                    : "border-[#C8A246]/40 bg-white text-[#C8A246] hover:bg-[#C8A246]/10"
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
                        ? "bg-[#C8A246] text-white hover:bg-[#B3903E] shadow-md shadow-[#C8A246]/20"
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
                    className="inline-flex w-full items-center justify-center rounded-xl bg-[#C8A246] px-4 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#B3903E] shadow-md shadow-[#C8A246]/20 disabled:opacity-70"
                  >
                    {isPending ? "Saving..." : (mode === "edit" ? "Save Changes" : "Save Assessment")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
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
