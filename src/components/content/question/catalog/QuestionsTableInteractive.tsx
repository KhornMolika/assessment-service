"use client";

import Link from "next/link";
import { useState, useEffect, useTransition } from "react";
import { Copy, Edit, Eye, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createQuestionAction } from "@/src/lib/actions/question.actions";
import type { QuestionBank, Question, Topic } from "@/src/types/api";
import { Badge } from "@/src/components/ui/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/ui/table";
import DeleteQuestionModal from "@/src/components/content/question/detail/DeleteQuestionModal";
import { Button } from "@/src/components/ui/ui/button";
import { ActionMenu } from "@/src/components/ui/ui/action-menu";

function getQuestionTypeVariant(type: string) {
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
    case "MATCHING":
      return "pending" as const;
    default:
      return "default" as const;
  }
}

function getDifficultyVariant(difficulty: string) {
  switch (difficulty?.toUpperCase()) {
    case "EASY":
      return "success" as const;
    case "MEDIUM":
      return "warning" as const;
    case "HARD":
      return "pending" as const; // Using pending for orange/reddish
    default:
      return "default" as const;
  }
}

export default function QuestionsTableInteractive({
  questions,
  banks,
  topics,
}: {
  questions: Question[];
  banks: QuestionBank[];
  topics: Topic[];
}) {
  const [items, setItems] = useState(questions);
  const [questionPendingDelete, setQuestionPendingDelete] = useState<Question | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    setItems(questions);
  }, [questions]);

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
            <TableHead>Difficulty</TableHead>
            <TableHead className="text-center">Points</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((question) => {
            return (
              <TableRow key={question.id}>
                <TableCell>
                  <div className="max-w-xl overflow-hidden">
                    <Link
                      href={`/questions/${question.id}`}
                      className="block truncate font-medium text-primary transition hover:text-pm hover:underline"
                    >
                      {question.questionText}
                    </Link>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getQuestionTypeVariant(question.type)}>{question.type.replace(/_/g, " ")}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getDifficultyVariant(question.difficulty)}>
                    {question.difficulty}
                  </Badge>
                </TableCell>
                <TableCell className="text-center font-semibold text-primary">{question.points}</TableCell>
                <TableCell>
                  <ActionMenu>
                    <Link
                      href={`/questions/${question.id}`}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4" /> View
                    </Link>
                    <Link
                      href={`/questions/${question.id}/edit`}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
                    >
                      <Edit className="h-4 w-4" /> Edit
                    </Link>
                    <Link
                      href={`/questions/${question.id}/duplicate`}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
                    >
                      <Copy className="h-4 w-4" /> Duplicate
                    </Link>
                    <button
                      onClick={() => setQuestionPendingDelete(question)}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </ActionMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <DeleteQuestionModal
        open={questionPendingDelete !== null}
        question={questionPendingDelete}
        onClose={() => setQuestionPendingDelete(null)}
        onDeleted={() => handleDeleteQuestion(questionPendingDelete?.id || "")}
      />
    </>
  );
}
