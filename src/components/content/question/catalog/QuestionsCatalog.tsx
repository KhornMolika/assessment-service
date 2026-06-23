"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Copy,
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type { QuestionBank, Question } from "@/src/types/api";
import {
  ALL_TOPICS_VALUE,
  questionMatchesTopic,
} from "@/src/utils/topic-utils";
import { Badge } from "@/src/components/ui/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/ui/table";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import { PaginatedCollectionCard } from "@/src/components/ui/data/PaginatedCollectionCard";
import {
  parsePositiveInteger,
  useDebouncedSearchParam,
  useUrlQueryUpdater,
} from "@/src/hooks/use-url-query-state";
import { Button } from "@/src/components/ui/ui/button";
import { Select } from "@/src/components/ui/ui/select";
import { Input } from "@/src/components/ui/ui/input";

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
      return "pending" as const;
    default:
      return "default" as const;
  }
}

export default function QuestionsCatalog({
  banks,
  initialQuestions,
}: {
  banks: QuestionBank[];
  initialQuestions: Question[];
}) {
  const searchParams = useSearchParams();
  const updateUrl = useUrlQueryUpdater();
  const { inputValue: searchQuery, setInputValue: setSearchQuery } = useDebouncedSearchParam({
    key: "query",
  });
  const [typeFilter, setTypeFilter] = useState<string>("All Types");
  const [manualBankFilter, setManualBankFilter] = useState<string | null>(null);
  const [builderCopied, setBuilderCopied] = useState(false);
  const currentPage = parsePositiveInteger(searchParams.get("page"), 1);
  const itemsPerPage = parsePositiveInteger(searchParams.get("pageSize"), 10);
  const [questions, setQuestions] = useState(initialQuestions);
  const [questionPendingDelete, setQuestionPendingDelete] = useState<Question | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  const bankMap = useMemo(
    () => Object.fromEntries(banks.map((bank) => [bank.id, bank])),
    [banks],
  );

  const bankFilter = useMemo(() => {
    if (manualBankFilter !== null) {
      return manualBankFilter;
    }

    const bankId = searchParams.get("bank");
    if (!bankId) {
      return "All Banks";
    }

    return bankMap[bankId]?.name ?? "All Banks";
  }, [bankMap, manualBankFilter, searchParams]);

  const topicFilter = searchParams.get("topic") ?? ALL_TOPICS_VALUE;

  const availableTypes = useMemo(
    () => Array.from(new Set(questions.map((question) => question.type))).sort(),
    [questions],
  );

  const availableBanks = useMemo(() => banks.map((bank) => bank.name), [banks]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      if (
        searchQuery &&
        !question.questionText.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (typeFilter !== "All Types" && question.type !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [questions, searchQuery, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedQuestions = filteredQuestions.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage,
  );

  const handleCopyQuestion = (question: Question) => {
    setQuestions((current) => {
      const duplicatedQuestion: Question = {
        ...question,
        id: `copy-${question.id}-${current.length + 1}`,
        questionText: `${question.questionText} (Copy)`,
      };

      return [duplicatedQuestion, ...current];
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions((current) => current.filter((question) => question.id !== questionId));
    setQuestionPendingDelete(null);
  };

  const handleCopyQuestionBuilder = async () => {
    await navigator.clipboard.writeText(`<QuestionBuilder
  tenantId="tenant-id"
  topicId="topic-id"
  questionId="question-id"
/>`);
    setBuilderCopied(true);
    window.setTimeout(() => setBuilderCopied(false), 1600);
  };

  const handlePageSizeChange = (size: number) => {
    updateUrl({
      pageSize: size === 10 ? null : size,
      page: null,
    });
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    typeFilter !== "All Types" ||
    bankFilter !== "All Banks";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeaderCard
        title="Questions"
        // description={`${questions.length} reusable questions across all topics.`}
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              onClick={() => void handleCopyQuestionBuilder()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:bg-muted sm:w-auto" variant="secondary"
            >
              <Copy className="h-4 w-4" />
              {builderCopied ? "Copied" : "Question Builder"}
            </Button>
            <Link
              href="/questions/new"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition hover:bg-pm sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              New Question
            </Link>
          </div>
        }
      />

      <PaginatedCollectionCard
        title="Question catalog"
        className="overflow-hidden"
        contentClassName="px-0 pb-0 sm:px-0 sm:pb-0"
        bodyClassName={filteredQuestions.length === 0 ? "px-4 pb-4 sm:px-6 sm:pb-6" : undefined}
        toolbar={
          <div className="grid gap-4 px-4 pt-4 sm:px-6 sm:pt-6 lg:grid-cols-[minmax(0,1fr)_220px_260px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-inkl" />
              <Input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-pm"
              />
            </div>

            <Select
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                updateUrl({ page: null });
              }}
              className="rounded-lg border border-border bg-card px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pm"
            >
              <option>All Types</option>
              {availableTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </Select>

            <Select
              value={bankFilter}
              onChange={(event) => {
                setManualBankFilter(event.target.value);
                updateUrl({ page: null });
              }}
              className="rounded-lg border border-border bg-card px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pm"
            >
              <option>All Banks</option>
              {availableBanks.map((bankName) => (
                <option key={bankName}>{bankName}</option>
              ))}
            </Select>
          </div>
        }
        isEmpty={filteredQuestions.length === 0}
        emptyState={
          <StateMessage
            title={hasActiveFilters ? "No questions found" : "No questions available"}
            description={
              hasActiveFilters
                ? "No questions match the current search, bank, topic, and type filters."
                : "Questions will appear here after they are added to one or more banks."
            }
            action={
              hasActiveFilters ? (
                <Button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setTypeFilter("All Types");
                    setManualBankFilter("All Banks");
                    updateUrl({
                      page: null,
                      query: null,
                      bank: null,
                    });
                  }}
                  className="inline-flex items-center justify-center rounded-2xl border border-border bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-muted" variant="secondary"
                >
                  Clear filters
                </Button>
              ) : null
            }
          />
        }
        pagination={{
          currentPage: activePage,
          totalPages,
          pageSize: itemsPerPage,
          totalItems: filteredQuestions.length,
          itemLabel: "questions",
          onPageChange: (page) => updateUrl({ page: page === 1 ? null : page }),
          onPageSizeChange: handlePageSizeChange,
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead className="text-center">Points</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedQuestions.map((question) => {
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
                  <TableCell className="text-sm text-inkd">Unknown bank</TableCell>
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
                      <Button
                        onClick={() => handleCopyQuestion(question)}
                        className="rounded p-1 transition hover:bg-muted"
                        title="Duplicate question" variant="secondary"
                      >
                        <Copy className="h-4 w-4 text-inkd" />
                      </Button>
                      <Button
                        onClick={() => setQuestionPendingDelete(question)}
                        className="rounded p-1 transition hover:bg-muted"
                        title="Delete question" variant="secondary"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </PaginatedCollectionCard>

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

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-inkd">
                Please type <strong>delete</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="delete"
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
    </div>
  );
}
