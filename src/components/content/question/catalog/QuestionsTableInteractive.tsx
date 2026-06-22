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
  const [questionPendingDuplicate, setQuestionPendingDuplicate] = useState<Question | null>(null);
  const [duplicateForm, setDuplicateForm] = useState({
    questionText: "",
    points: 1,
    difficulty: "MEDIUM",
    topicId: "",
  });
  const [isPending, startTransition] = useTransition();

  const [topicSearch, setTopicSearch] = useState("");
  const [isTopicDropdownOpen, setIsTopicDropdownOpen] = useState(false);
  
  const selectedTopic = topics?.find((t) => t.id === duplicateForm.topicId);
  const isActivelySearching = topicSearch !== (selectedTopic?.name || "");

  const filteredTopics = topics?.filter((t) => {
    if (!isActivelySearching) return true;
    return t.name.toLowerCase().includes(topicSearch.toLowerCase());
  }) || [];

  useEffect(() => {
    setItems(questions);
  }, [questions]);

  const handleOpenDuplicate = (question: Question) => {
    setQuestionPendingDuplicate(question);
    const initialTopicId = question.topicId || (topics && topics.length > 0 ? topics[0].id : "");
    const initialTopic = topics?.find((t) => t.id === initialTopicId);

    setDuplicateForm({
      questionText: `${question.questionText} (Copy)`,
      points: question.points,
      difficulty: question.difficulty,
      topicId: initialTopicId,
    });
    setTopicSearch(initialTopic ? initialTopic.name : "");
  };

  const handleConfirmDuplicate = () => {
    if (!questionPendingDuplicate) return;

    if (!duplicateForm.topicId) {
      toast.error("Cannot duplicate question: missing topic ID.");
      return;
    }

    startTransition(async () => {
      const duplicateData = {
        ...questionPendingDuplicate,
        questionText: duplicateForm.questionText,
        points: duplicateForm.points,
        difficulty: duplicateForm.difficulty as any,
        topicId: duplicateForm.topicId,
      };

      // Remove generated fields
      delete (duplicateData as any).id;
      delete (duplicateData as any).createdAt;
      delete (duplicateData as any).updatedAt;

      const res = await createQuestionAction(duplicateForm.topicId, duplicateData);

      if (res.success && res.question) {
        toast.success("Question duplicated successfully");
        setItems((current) => [res.question!, ...current]);
        setQuestionPendingDuplicate(null);
      } else {
        toast.error(res.error || "Failed to duplicate question");
      }
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
                    <Button
                      onClick={() => handleOpenDuplicate(question)}
                      size="icon"
                      className="h-8 w-8 rounded text-indigo-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                      title="Duplicate question" variant="ghost"
                    >
                      <Copy className="h-5 w-5" />
                    </Button>
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
                onClick={() => setQuestionPendingDelete(null)}
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

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                onClick={() => setQuestionPendingDelete(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted" variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteQuestion(questionPendingDelete.id)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700" variant="destructive"
              >
                Delete question
              </Button>
            </div>
          </div>
        </div>
      )}

      {questionPendingDuplicate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-primary">Duplicate question</h2>
                <p className="mt-2 text-sm text-inkd">
                  Modify the details below to create a new question based on the selected one.
                </p>
              </div>
              <Button
                onClick={() => setQuestionPendingDuplicate(null)}
                className="rounded p-1 transition hover:bg-muted"
                aria-label="Close duplicate modal" variant="secondary"
              >
                <X className="h-5 w-5 text-inkd" />
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-primary">Topic</label>
                <div className="relative">
                  <input
                    type="text"
                    value={topicSearch}
                    onChange={(e) => {
                      setTopicSearch(e.target.value);
                      setIsTopicDropdownOpen(true);
                      setDuplicateForm({ ...duplicateForm, topicId: "" });
                    }}
                    onFocus={() => setIsTopicDropdownOpen(true)}
                    onBlur={() => {
                      // Delay to allow mousedown on dropdown items to fire
                      setTimeout(() => setIsTopicDropdownOpen(false), 200);
                    }}
                    placeholder="Search for a topic..."
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
                  />
                  {isTopicDropdownOpen && (
                    <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
                      {filteredTopics.length > 0 ? (
                        filteredTopics.map((t) => (
                          <div
                            key={t.id}
                            className={`cursor-pointer px-4 py-2 text-sm hover:bg-muted ${
                              duplicateForm.topicId === t.id
                                ? "bg-muted font-medium text-pm"
                                : "text-primary"
                            }`}
                            onMouseDown={() => {
                              setDuplicateForm({ ...duplicateForm, topicId: t.id });
                              setTopicSearch(t.name);
                              setIsTopicDropdownOpen(false);
                            }}
                          >
                            {t.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-inkd">No topics found.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-primary">Question text</label>
                <textarea
                  value={duplicateForm.questionText}
                  onChange={(e) => setDuplicateForm({ ...duplicateForm, questionText: e.target.value })}
                  className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-primary">Difficulty</label>
                  <select
                    value={duplicateForm.difficulty}
                    onChange={(e) => setDuplicateForm({ ...duplicateForm, difficulty: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-primary">Points</label>
                  <input
                    type="number"
                    min="1"
                    value={duplicateForm.points}
                    onChange={(e) => setDuplicateForm({ ...duplicateForm, points: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button
                onClick={() => setQuestionPendingDuplicate(null)}
                disabled={isPending}
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium transition hover:bg-muted" variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDuplicate}
                disabled={isPending}
                className="inline-flex rounded-xl bg-pm px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pm/90 disabled:opacity-50"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save as new question
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
