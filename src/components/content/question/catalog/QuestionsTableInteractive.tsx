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
              <Button
                onClick={() => {
                  setQuestionPendingDelete(null);
                  setDeleteConfirmText("");
                }}
                className="rounded p-1 transition hover:bg-muted"
                aria-label="Close delete confirmation" variant="secondary"
              >
                <X className="h-5 w-5 text-inkd" />
              </Button>
            </div>

            <div className="mt-4 rounded-xl bg-muted p-4">
              <div className="line-clamp-3 text-sm font-medium text-primary">
                {questionPendingDelete.questionText}
              </div>
              <div className="mt-2 text-xs text-inkd">
                {questionPendingDelete.type.replace(/_/g, " ")}
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-inkd">
                Please type <strong>delete</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Type 'delete'"
              />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                onClick={() => {
                  setQuestionPendingDelete(null);
                  setDeleteConfirmText("");
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted" variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleDeleteQuestion(questionPendingDelete.id);
                  setDeleteConfirmText("");
                }}
                disabled={deleteConfirmText.toLowerCase() !== "delete"}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed" variant="destructive"
              >
                Delete question
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
