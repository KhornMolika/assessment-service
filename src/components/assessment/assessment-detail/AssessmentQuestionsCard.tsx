"use client";

import { useState, useTransition } from "react";
import { FileText, Plus, Trash2, Loader2 } from "lucide-react";
import type { AssessmentDetailQuestionItem, AssessmentDetailRecord } from "@/src/types/assessment-detail.types";
import { PaginatedCollectionCard } from "@/src/components/ui/data/PaginatedCollectionCard";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import { Badge } from "@/src/components/ui/ui/badge";
import { Button } from "@/src/components/ui/ui/button";
import AddAssessmentQuestionsModal from "@/src/components/ui/modals/AddAssessmentQuestionsModal";
import DeleteConfirmModal from "@/src/components/ui/modals/DeleteConfirmModal";
import { removeQuestionFromAssessmentAction } from "@/src/lib/actions/assessment.actions";
import { toast } from "sonner";

function getTypeVariant(type: string) {
  switch (type) {
    case "SINGLE_CHOICE":
    case "MULTIPLE_CHOICE":
      return "info" as const;
    case "TRUE_FALSE":
      return "success" as const;
    case "SHORT_ANSWER":
      return "secondary" as const;
    case "ESSAY":
      return "pending" as const;
    case "RATING":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

export default function AssessmentQuestionsCard({
  assessment,
  questions,
  totalQuestions,
}: {
  assessment: AssessmentDetailRecord;
  questions: AssessmentDetailQuestionItem[];
  totalQuestions: number;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<{ id: string, name: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);
  
  const totalPages = Math.max(1, Math.ceil(questions.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedQuestions = questions.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage,
  );

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const isDraft = assessment.status === "DRAFT";

  const handleRemove = (assessmentQuestionId: string) => {
    if (!assessment.id) return;
    setRemovingId(assessmentQuestionId);
    startTransition(async () => {
      const res = await removeQuestionFromAssessmentAction(assessment.id, assessmentQuestionId);
      if (res?.success) {
        toast.success("Question removed");
        setDeleteModalOpen(false);
        setQuestionToDelete(null);
      } else {
        toast.error(res?.message || "Failed to remove question");
      }
      setRemovingId(null);
    });
  };

  return (
    <>
    <PaginatedCollectionCard
      className="flex-1 shadow-sm border-slate-200"
      title={
        <span className="flex items-center gap-2 text-lg text-slate-800">
          <FileText className="h-5 w-5 text-blue-500" />
          Questions ({totalQuestions})
        </span>
      }
      description="A preview of questions assigned to this assessment."
      headerAction={
        isDraft ? (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 bg-white"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Questions
          </Button>
        ) : undefined
      }
      headerClassName="bg-slate-50 border-b border-slate-100 rounded-t-xl pb-4"
      contentClassName="pt-6 px-0 pb-0 sm:px-0 sm:pb-0"
      bodyClassName={questions.length === 0 ? "mx-6" : "space-y-4"}
      isEmpty={questions.length === 0}
      emptyState={
        <StateMessage
          title="No questions assigned"
          description="This assessment does not have any question records to display yet."
        />
      }
      pagination={{
        currentPage: activePage,
        totalPages,
        pageSize: itemsPerPage,
        totalItems: questions.length,
        pageSizeOptions: [5, 10, 20, 50],
        itemLabel: "questions",
        onPageChange: setCurrentPage,
        onPageSizeChange: handlePageSizeChange,
      }}
    >
      {paginatedQuestions.map((question, index) => (
        <div
          key={question.id}
          className="mx-6 rounded-lg border border-border/70 p-4 transition hover:bg-slate-50 flex items-start justify-between gap-4"
        >
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accp text-sm font-bold text-primary">
              {(activePage - 1) * itemsPerPage + index + 1}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-primary">{question.question}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant={getTypeVariant(question.type || "UNKNOWN")}>{(question.type || "UNKNOWN").replace(/_/g, " ")}</Badge>
                <span className="text-xs font-medium text-inkd">{question.points} pts</span>
              </div>
            </div>
          </div>
          {isDraft && (
            <div className="flex-shrink-0 pt-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                onClick={() => {
                  setQuestionToDelete({ id: question.id, name: "this question" });
                  setDeleteModalOpen(true);
                }}
                disabled={isPending && removingId === question.id}
              >
                {isPending && removingId === question.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      ))}
    </PaginatedCollectionCard>

    <AddAssessmentQuestionsModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      assessmentId={assessment.id}
      topicId={(assessment as any).topic?.id || (assessment as any).topicId || ""}
      existingQuestionIds={questions.map(q => q.question_id || q.id)}
    />
    </>
  );
}
