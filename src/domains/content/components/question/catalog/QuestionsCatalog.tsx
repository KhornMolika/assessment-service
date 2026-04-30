"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import type { Bank } from "@/src/domains/content/types/bank.types";
import type {
  QuestionCatalogItem,
  QuestionCatalogType,
} from "@/src/domains/content/types/question-catalog.types";
import type { QuestionTopicMap } from "@/src/domains/content/types/topic.types";
import {
  ALL_TOPICS_VALUE,
  questionMatchesTopic,
} from "@/src/domains/content/utils/topic-utils";
import { Badge } from "@/src/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import { PageHeaderCard } from "@/src/shared/components/layout/PageHeaderCard";
import { StateMessage } from "@/src/shared/components/feedback/StateMessage";
import { PaginatedCollectionCard } from "@/src/shared/components/data/PaginatedCollectionCard";
import {
  parsePositiveInteger,
  useDebouncedSearchParam,
  useUrlQueryUpdater,
} from "@/src/shared/hooks/use-url-query-state";

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

export default function QuestionsCatalog({
  banks,
  initialQuestions,
  questionTopics,
}: {
  banks: Bank[];
  initialQuestions: QuestionCatalogItem[];
  questionTopics: QuestionTopicMap[];
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
  const [questionPendingDelete, setQuestionPendingDelete] =
    useState<QuestionCatalogItem | null>(null);

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
      const bankName = question.bank_id
        ? bankMap[question.bank_id]?.name ?? "Unknown bank"
        : "Unassigned";

      if (
        searchQuery &&
        !question.text.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (typeFilter !== "All Types" && question.type !== typeFilter) {
        return false;
      }

      if (
        topicFilter !== ALL_TOPICS_VALUE &&
        !questionMatchesTopic(question.id, topicFilter, questionTopics)
      ) {
        return false;
      }

      if (bankFilter !== "All Banks" && bankName !== bankFilter) {
        return false;
      }

      return true;
    });
  }, [bankFilter, bankMap, questionTopics, questions, searchQuery, topicFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedQuestions = filteredQuestions.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage,
  );

  const handleCopyQuestion = (question: QuestionCatalogItem) => {
    setQuestions((current) => {
      const duplicatedQuestion: QuestionCatalogItem = {
        ...question,
        id: `copy-${question.id}-${current.length + 1}`,
        text: `${question.text} (Copy)`,
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
    topicFilter !== ALL_TOPICS_VALUE ||
    typeFilter !== "All Types" ||
    bankFilter !== "All Banks";

  return (
    <div className="space-y-6 px-4 py-4">
      <PageHeaderCard
        title="Questions"
        description={`${questions.length} reusable questions across all banks.`}
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => void handleCopyQuestionBuilder()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:bg-muted sm:w-auto"
            >
              <Copy className="h-4 w-4" />
              {builderCopied ? "Copied" : "Question Builder"}
            </button>
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
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-pm"
              />
            </div>

            <select
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
            </select>

            <select
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
            </select>
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
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setTypeFilter("All Types");
                    setManualBankFilter("All Banks");
                    updateUrl({
                      page: null,
                      query: null,
                      bank: null,
                      topic: null,
                    });
                  }}
                  className="inline-flex items-center justify-center rounded-2xl border border-border bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
                >
                  Clear filters
                </button>
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
              <TableHead>Bank</TableHead>
              <TableHead className="text-center">Points</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedQuestions.map((question) => {
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
    </div>
  );
}
