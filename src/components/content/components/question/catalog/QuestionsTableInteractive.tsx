"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Copy, Edit, Eye, Trash2, X } from "lucide-react";
import type { Bank } from "@/src/types/bank.types";
import type {
  QuestionCatalogItem,
  QuestionCatalogType,
} from "@/src/types/question-catalog.types";
import { Badge } from "@/src/components/ui/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/ui/table";

function getQuestionTypeVariant(type: QuestionCatalogType) {
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
    case "Matching":
      return "pending" as const;
    default:
      return "default" as const;
  }
}

export default function QuestionsTableInteractive({
  questions,
  banks,
}: {
  questions: QuestionCatalogItem[];
  banks: Bank[];
}) {
  const [items, setItems] = useState(questions);
  const [questionPendingDelete, setQuestionPendingDelete] =
    useState<QuestionCatalogItem | null>(null);
  const bankMap = useMemo(
    () => Object.fromEntries(banks.map((bank) => [bank.id, bank])),
    [banks],
  );

  const handleCopyQuestion = (question: QuestionCatalogItem) => {
    setItems((current) => {
      const duplicatedQuestion: QuestionCatalogItem = {
        ...question,
        id: `copy-${question.id}-${current.length + 1}`,
        text: `${question.text} (Copy)`,
      };

      return [duplicatedQuestion, ...current];
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    setItems((current) => current.filter((question) => question.id !== questionId));
    setQuestionPendingDelete(null);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Question</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Bank</TableHead>
            <TableHead className="text-center">Points</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((question) => {
            const bank = question.bank_id ? bankMap[question.bank_id] : undefined;

            return (
              <TableRow key={question.id}>
                <TableCell>
                  <div className="max-w-xl">
                    <Link
                      href={`/questions/${question.id}`}
                      className="line-clamp-3 font-medium text-primary transition hover:text-pm hover:underline"
                    >
                      {question.text}
                    </Link>
                    {question.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {question.tags.map((tag) => (
                          <span
                            key={`${question.id}-${tag}`}
                            className="rounded bg-muted px-2 py-0.5 text-xs text-inkd"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getQuestionTypeVariant(question.type)}>{question.type}</Badge>
                </TableCell>
                <TableCell className="text-sm text-inkd">{bank?.name ?? "Unknown bank"}</TableCell>
                <TableCell className="text-center font-semibold text-primary">{question.points}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/questions/${question.id}`}
                      className="rounded p-1 transition hover:bg-muted"
                      title="View question"
                    >
                      <Eye className="h-4 w-4 text-inkd" />
                    </Link>
                    <Link
                      href={`/questions/${question.id}/edit`}
                      className="rounded p-1 transition hover:bg-muted"
                      title="Edit question"
                    >
                      <Edit className="h-4 w-4 text-inkd" />
                    </Link>
                    <button
                      onClick={() => handleCopyQuestion(question)}
                      className="rounded p-1 transition hover:bg-muted"
                      title="Duplicate question"
                    >
                      <Copy className="h-4 w-4 text-inkd" />
                    </button>
                    <button
                      onClick={() => setQuestionPendingDelete(question)}
                      className="rounded p-1 transition hover:bg-muted"
                      title="Delete question"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {questionPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-primary">Delete question?</h2>
                <p className="mt-2 text-sm text-inkd">
                  This action removes the selected question from the current list.
                </p>
              </div>
              <button
                onClick={() => setQuestionPendingDelete(null)}
                className="rounded p-1 transition hover:bg-muted"
                aria-label="Close delete confirmation"
              >
                <X className="h-5 w-5 text-inkd" />
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-muted p-4">
              <div className="line-clamp-3 text-sm font-medium text-primary">
                {questionPendingDelete.text}
              </div>
              <div className="mt-2 text-xs text-inkd">
                {questionPendingDelete.bank_id
                  ? bankMap[questionPendingDelete.bank_id]?.name ?? "Unknown bank"
                  : "Unassigned"} | {questionPendingDelete.type}
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setQuestionPendingDelete(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteQuestion(questionPendingDelete.id)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Delete question
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
