"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import type { Question } from "@/src/types/api";
import { Badge } from "@/src/components/ui/ui/badge";
import { PaginatedCollectionCard } from "@/src/components/ui/data/PaginatedCollectionCard";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";

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
  bankName,
  questions,
}: {
  bankName: string;
  questions: Question[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
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
    <PaginatedCollectionCard
      title={
        <span className="flex items-center gap-2 text-xl">
          <FileText className="h-5 w-5" />
          Questions ({questions.length})
        </span>
      }
      contentClassName="px-0 pb-0 sm:px-0 sm:pb-0"
      bodyClassName={questions.length === 0 ? "mx-6" : "space-y-4"}
      isEmpty={questions.length === 0}
      emptyState={
        <StateMessage
          title="No questions in this bank"
          description={`No questions have been added to ${bankName} yet.`}
        />
      }
      pagination={{
        currentPage: activePage,
        totalPages,
        pageSize: itemsPerPage,
        totalItems: questions.length,
        itemLabel: "questions",
        onPageChange: setCurrentPage,
        onPageSizeChange: handlePageSizeChange,
      }}
    >
      {paginatedQuestions.map((question, index) => (
        <div
          key={question.id}
          className="mx-6 rounded-lg border border-border/70 p-4 transition hover:bg-muted/30"
        >
          <div className="mb-3 flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accp text-sm font-bold text-primary">
              {(activePage - 1) * itemsPerPage + index + 1}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-primary">{question.questionText}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant={getTypeVariant(question.type)}>{question.type}</Badge>
                <Badge variant={getDifficultyVariant(question.difficulty)}>
                  {question.difficulty}
                </Badge>
                <span className="text-xs font-medium text-inkd">{question.points} pts</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </PaginatedCollectionCard>
  );
}
