"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import type { QuestionCatalogItem } from "@/src/domains/content/types";
import { Badge } from "@/src/shared/components/ui/badge";
import Pagination from "@/src/shared/components/navigation/Pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/shared/components/ui/card";

function getTypeVariant(type: QuestionCatalogItem["type"]) {
  switch (type) {
    case "MCQ":
    case "Multiple Choice":
      return "info" as const;
    case "True/False":
      return "success" as const;
    case "Short Answer":
      return "secondary" as const;
    case "Long Essay":
      return "pending" as const;
    case "Rating":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

function getDifficultyVariant(difficulty: QuestionCatalogItem["difficulty"]) {
  switch (difficulty) {
    case "Easy":
      return "success" as const;
    case "Medium":
      return "warning" as const;
    default:
      return "pending" as const;
  }
}

export default function QuestionBankRecentQuestions({
  bankName,
  questions,
}: {
  bankName: string;
  questions: QuestionCatalogItem[];
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-5 w-5" />
          Questions ({questions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-0 pb-0 sm:px-0 sm:pb-0">
        {questions.length === 0 ? (
          <div className="mx-6 rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-inkd">
            No questions have been added to {bankName} yet.
          </div>
        ) : (
          paginatedQuestions.map((question, index) => (
            <div
              key={question.id}
              className="mx-6 rounded-lg border border-border/70 p-4 transition hover:bg-muted/30"
            >
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accp text-sm font-bold text-primary">
                  {(activePage - 1) * itemsPerPage + index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-primary">{question.text}</p>
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
          ))
        )}
        <Pagination
          currentPage={activePage}
          totalPages={totalPages}
          pageSize={itemsPerPage}
          totalItems={questions.length}
          itemLabel="questions"
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </CardContent>
    </Card>
  );
}
