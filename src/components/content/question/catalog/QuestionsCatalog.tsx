"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import QuestionsTableInteractive from "./QuestionsTableInteractive";
import DeleteQuestionModal from "@/src/components/content/question/detail/DeleteQuestionModal";
import { useSearchParams } from "next/navigation";
import {
  Copy,
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  X,
} from "lucide-react";
import type { QuestionBank, Question } from "@/src/types/api";
import {
  ALL_TOPICS_VALUE,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
import { IntegrationModal } from "@/src/components/ui/modals/IntegrationModal";
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
  const currentPage = parsePositiveInteger(searchParams.get("page"), 1);
  const itemsPerPage = parsePositiveInteger(searchParams.get("pageSize"), 10);
  const [questions, setQuestions] = useState(initialQuestions);
  const [questionPendingDelete, setQuestionPendingDelete] = useState<Question | null>(null);
  const [integrationOpen, setIntegrationOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row embed-only-element">
            <Button
              type="button"
              onClick={() => setIntegrationOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:bg-muted sm:w-auto" variant="secondary"
            >
              <Copy className="h-4 w-4" />
              Integrate Builder
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
      
      <IntegrationModal
        open={integrationOpen}
        onClose={() => setIntegrationOpen(false)}
        componentName="QuestionBuilder"
        componentExport="QuestionBuilder"
        description="The individual builder wizard for authoring new questions."
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

      <DeleteQuestionModal
        open={questionPendingDelete !== null}
        question={questionPendingDelete}
        onClose={() => setQuestionPendingDelete(null)}
        onDeleted={() => handleDeleteQuestion(questionPendingDelete?.id || "")}
      />
    </div>
  );
}
