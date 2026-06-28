"use client";

import React, { useState } from "react";
import type { QuestionBank, Question } from "@/src/types/api";
import type { Topic } from "@/src/types/topic.types";
import type { NewAssessmentFormData } from "@/src/types/assessment-form.types";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import AssessmentBasicInfoStep from "./AssessmentBasicInfoStep";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import AssessmentSettingsStep from "./AssessmentSettingsStep";
import AssessmentQuestionStep from "./AssessmentQuestionStep";
import AssessmentSummaryCard from "./AssessmentSummaryCard";
import { Button } from "@/src/components/ui/ui/button";
import { Modal } from "@/src/components/ui/ui/modal";
import Link from "next/link";
import { useAssessmentForm } from "@/src/hooks/use-assessment-form";
import { toast } from "sonner";

export default function AssessmentForm({
  banks,
  questions,
  topics,
  mode = "create",
  assessmentId,
  initialFormData,
  fetchError,
}: {
  banks: QuestionBank[];
  questions: Question[];
  topics: Topic[];
  mode?: "create" | "edit" | "duplicate";
  assessmentId?: string;
  initialFormData?: NewAssessmentFormData;
  fetchError?: string;
  status?: string;
}) {
  const {
    currentStep,
    questionSearch,
    setQuestionSearch,
    formData,
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handlePublish,
    destination,
    activeTopic
  } = useAssessmentForm({ mode, assessmentId, initialFormData });

  const [warningType, setWarningType] = useState<"DEFAULT_SETTINGS" | "PAST_START_DATE" | "MISSING_START_DATE" | "CONTAINS_INVALID_QUESTIONS" | null>(null);

  React.useEffect(() => {
    if (fetchError) {
      toast.error(fetchError);
    }
  }, [fetchError]);

  const invalidQuestions = formData.sessionMode === "REAL_TIME" 
    ? questions.filter(q => formData.selectedQuestionIds.includes(q.id) && (q.type === "ESSAY" || q.type === "SHORT_ANSWER"))
    : [];
  const isPublishedEdit = mode === "edit" && formData.status === "PUBLISHED";

  const onContinueClick = () => {
    if (currentStep === 2) {
      if (invalidQuestions.length > 0) {
        setWarningType("CONTAINS_INVALID_QUESTIONS");
        return;
      }

      const isMissingDatesAndLimit = !formData.startsAt && !formData.endsAt && (!formData.enableTimeLimit || !formData.timeLimitMinutes);
      const isPastStartDate = formData.startsAt && new Date(formData.startsAt).getTime() < Date.now();
      const isMissingStartDateButHasEnd = !formData.startsAt && formData.endsAt;

      if (isPastStartDate) {
        setWarningType("PAST_START_DATE");
        return;
      }
      if (isMissingStartDateButHasEnd) {
        setWarningType("MISSING_START_DATE");
        return;
      }
      if (isMissingDatesAndLimit) {
        setWarningType("DEFAULT_SETTINGS");
        return;
      }
    }
    handleNext();
  };

  const confirmWarning = () => {
    const currentWarning = warningType;
    setWarningType(null);
    
    if (currentWarning === "CONTAINS_INVALID_QUESTIONS") {
      const invalidIds = invalidQuestions.map(q => q.id);
      const filteredSelected = formData.selectedQuestionIds.filter(id => !invalidIds.includes(id));
      handleChange("selectedQuestionIds", filteredSelected);
    }
    
    handleNext();
  };

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
    isPublishedEdit
      ? "This assessment is published, so only the schedule and time limit can be changed."
      : mode === "edit"
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
                  {isPublishedEdit
                    ? "Published Schedule"
                    : mode === "edit"
                    ? "Assessment Setup"
                    : "Build Your Assessment"}
                </h2>
                <p className="text-sm text-inkd">
                  {isPublishedEdit
                    ? "Update the time limit, start date, and end date for this published assessment."
                    : "Complete the current section before moving forward."}
                </p>
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                {isPublishedEdit ? "Schedule only" : `Step ${currentStep} of 3`}
              </div>
            </div>
          </div>

          <div className="px-3 py-3 sm:px-4 sm:py-4 relative z-10">
            {!activeTopic && !formData.ownerTopicId && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-md">
                <div className="flex">
                  <div className="shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Owner topic is required. You must select a global Topic from the topbar before managing assessments.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <form id={formId} onSubmit={handleSubmit} className="min-w-0" onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
                e.preventDefault();
              }
            }}>
              <fieldset disabled={isPending || (!activeTopic && !formData.ownerTopicId)}>


              {currentStep === 1 ? (
                <AssessmentBasicInfoStep
                  formData={formData}
                  topics={topics}
                  onChange={handleChange}
                  originalStatus={initialFormData?.status}
                />
              ) : currentStep === 2 ? (
                <AssessmentSettingsStep
                  formData={formData}
                  onChange={handleChange}
                  onGradeLabelChange={handleGradeLabelChange}
                  onAddGradeLabel={handleAddGradeLabel}
                  onRemoveGradeLabel={handleRemoveGradeLabel}
                  publishedScheduleOnly={isPublishedEdit}
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
                disabled={currentStep === 1 || isPublishedEdit}
                className={`inline-flex w-full items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition sm:w-auto ${
                  currentStep === 1 || isPublishedEdit
                    ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                    : "border-[#C8A246]/40 bg-white text-[#C8A246] hover:bg-[#C8A246]/10"
                }`}
              >
                Previous
              </Button>
              <div className="sm:min-w-52">
                {currentStep < 3 && !isPublishedEdit ? (
                  <Button
                    type="button"
                    onClick={onContinueClick}
                    disabled={!canContinue}
                    className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      canContinue
                        ? "bg-[#C8A246] text-white hover:bg-[#B3903E] shadow-md shadow-[#C8A246]/20"
                        : "cursor-not-allowed bg-slate-100 text-slate-400"
                    }`}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="button"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onClick={(e) => handleSubmit(e as any)}
                    disabled={isPending || !canContinue}
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

      <Modal open={warningType !== null} onClose={() => setWarningType(null)}>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          {warningType === "DEFAULT_SETTINGS" && "Default Settings Warning"}
          {warningType === "PAST_START_DATE" && "Past Start Date"}
          {warningType === "MISSING_START_DATE" && "Missing Start Date"}
          {warningType === "CONTAINS_INVALID_QUESTIONS" && "Invalid Questions For Real-Time"}
        </h2>
        <div className="text-sm text-slate-600 mb-6 leading-relaxed">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          {warningType === "DEFAULT_SETTINGS" && <p>You haven't selected a start date, end date, or time limit. We will proceed using the default settings configuration (no time limit, always available). Are you sure you want to proceed?</p>}
          {warningType === "PAST_START_DATE" && <p>You have selected a Start Date that is in the past. This means participants will be able to join the assessment immediately. Are you sure you want to proceed?</p>}
          {warningType === "MISSING_START_DATE" && <p>You have selected an End Date but no Start Date. This means the assessment is effectively active immediately until the End Date. Are you sure you want to proceed?</p>}
          {warningType === "CONTAINS_INVALID_QUESTIONS" && (
            <>
              <p className="mb-3">
                <strong>REAL_TIME</strong> assessments do not support <strong>ESSAY</strong> or <strong>SHORT_ANSWER</strong> questions. The following questions will be automatically removed from your assessment if you proceed:
              </p>
              <ul className="list-disc pl-5 space-y-2 max-h-40 overflow-y-auto rounded-lg bg-slate-50 p-3 border border-slate-200">
                {invalidQuestions.map(q => (
                  <li key={q.id} className="text-slate-700 font-medium">{q.questionText || "Untitled Question"}</li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setWarningType(null)} className="rounded-xl border-slate-200">
            Cancel
          </Button>
          <Button 
            onClick={confirmWarning}
            className="rounded-xl bg-[#C8A246] hover:bg-[#B3903E] text-white"
          >
            Confirm & Continue
          </Button>
        </div>
      </Modal>
    </div>
  );
}
