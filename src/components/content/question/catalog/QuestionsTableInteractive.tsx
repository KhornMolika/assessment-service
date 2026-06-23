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
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/questions/${question.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded text-blue-500 transition hover:bg-blue-50 hover:text-blue-600"
                      title="View question"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                    <Link
                      href={`/questions/${question.id}/edit`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded text-emerald-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                      title="Edit question"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <Link
                      href={`/questions/${question.id}/duplicate`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded text-indigo-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                      title="Duplicate question"
                    >
                      <Copy className="h-5 w-5" />
                    </Link>
                    <Button
                      onClick={() => setQuestionPendingDelete(question)}
                      size="icon"
                      className="h-8 w-8 rounded text-red-500 transition hover:bg-red-50 hover:text-red-600"
                      title="Delete question" variant="ghost"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
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
