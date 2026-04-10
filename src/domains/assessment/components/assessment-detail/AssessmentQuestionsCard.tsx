"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import type { AssessmentDetailQuestionItem } from "@/src/domains/assessment/types/assessment-detail.types";
import Pagination from "@/src/shared/components/navigation/Pagination";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/ui/card";

export default function AssessmentQuestionsCard({
  questions,
  totalQuestions,
}: {
  questions: AssessmentDetailQuestionItem[];
  totalQuestions: number;
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
          Questions ({totalQuestions})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-0 pb-0 sm:px-0 sm:pb-0">
        {paginatedQuestions.map((question, index) => (
          <div
            key={question.id}
            className="mx-6 flex items-center justify-between rounded-lg border border-border/70 p-4 transition hover:bg-muted/30"
          >
            <div className="flex flex-1 items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accp text-sm font-bold text-primary">
                {(activePage - 1) * itemsPerPage + index + 1}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-primary">
                  {question.question}
                </div>
                <div className="text-sm text-inkd">{question.type}</div>
              </div>
            </div>
            <div className="ml-4 text-right text-sm font-bold text-primary">
              {question.points} pts
            </div>
          </div>
        ))}
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
