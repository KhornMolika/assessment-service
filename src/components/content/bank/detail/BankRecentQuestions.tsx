"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import type { Question } from "@/src/types/api";
import { Badge } from "@/src/components/ui/ui/badge";
import { PaginatedCollectionCard } from "@/src/components/ui/data/PaginatedCollectionCard";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/ui/button";
import AddQuestionsToBankModal from "./AddQuestionsToBankModal";
import RemoveQuestionFromBankModal from "./RemoveQuestionFromBankModal";

function getTypeVariant(type: Question["type"]) {
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

function getDifficultyVariant(difficulty: Question["difficulty"]) {
  switch (difficulty) {
    case "EASY":
      return "success" as const;
    case "MEDIUM":
      return "warning" as const;
    default:
      return "pending" as const;
  }
}

export default function BankRecentQuestions({
  bankId,
  bankName,
  questions,
  onRefresh,
}: {
  bankId: string;
  bankName: string;
  questions: Question[];
  onRefresh?: () => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [questionToRemove, setQuestionToRemove] = useState<Question | null>(null);

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

  return (
    <>
      <PaginatedCollectionCard
        className="flex-1 shadow-sm border-slate-200"
        title={
          <span className="flex items-center gap-2 text-lg text-slate-800">
            <FileText className="h-5 w-5 text-blue-500" />
            Questions ({questions.length})
          </span>
        }
        description="A preview of questions inside this bank."
        headerClassName="bg-slate-50 border-b border-slate-100 rounded-t-xl pb-4"
        headerAction={
          <Button onClick={() => setAddModalOpen(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
            <Plus className="h-4 w-4" />
            Add Questions
          </Button>
        }
        contentClassName="pt-6 px-0 pb-0 sm:px-0 sm:pb-0"
        bodyClassName={questions.length === 0 ? "mx-6" : "space-y-4"}
        isEmpty={questions.length === 0}
        emptyState={
          <StateMessage
            title="No questions in this bank"
            description={`No questions have been added to ${bankName} yet.`}
            action={
              <Button variant="outline" onClick={() => setAddModalOpen(true)} className="mt-4 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                <Plus className="h-4 w-4 mr-2" />
                Add Questions
              </Button>
            }
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
                <p className="font-semibold text-primary">{question.questionText}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant={getTypeVariant(question.type)}>{question.type.replace(/_/g, " ")}</Badge>
                  <Badge variant={getDifficultyVariant(question.difficulty)}>
                    {question.difficulty.toLowerCase()}
                  </Badge>
                  <span className="text-xs font-medium text-inkd">{question.points} pts</span>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuestionToRemove(question)}
              className="text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </PaginatedCollectionCard>

      <AddQuestionsToBankModal 
        open={addModalOpen} 
        onClose={() => setAddModalOpen(false)} 
        bankId={bankId} 
        existingQuestionIds={questions.map((q) => q.id)} 
        onRefresh={onRefresh}
      />
      
      <RemoveQuestionFromBankModal 
        open={!!questionToRemove} 
        onClose={() => setQuestionToRemove(null)} 
        bankId={bankId} 
        question={questionToRemove} 
        onRefresh={onRefresh}
      />
    </>
  );
}
