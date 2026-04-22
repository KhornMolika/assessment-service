"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Copy,
  Download,
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import Pagination from "@/src/shared/components/navigation/Pagination";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All Types");
  const [manualBankFilter, setManualBankFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 px-4 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Questions</h1>
          <p className="mt-1 text-inkd">All questions across {banks.length} banks</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 transition hover:bg-muted">
            <Download className="h-4 w-4" />
            Export
          </button>
          <Link
            href="/questions/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition hover:bg-pm"
          >
            <Plus className="h-4 w-4" />
            New Question
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_260px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-inkl" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-pm"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(event) => {
            setTypeFilter(event.target.value);
            setCurrentPage(1);
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
            setCurrentPage(1);
          }}
          className="rounded-lg border border-border bg-card px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pm"
        >
          <option>All Banks</option>
          {availableBanks.map((bankName) => (
            <option key={bankName}>{bankName}</option>
          ))}
        </select>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Question catalog</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 sm:px-0 sm:pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead className="text-center">Points</TableHead>
                <TableHead className="text-center">Lang.</TableHead>
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
                        <div className="line-clamp-3 font-medium text-primary">{question.text}</div>
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
                    <TableCell className="text-center text-sm text-inkd">{question.language}</TableCell>
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

          <Pagination
            currentPage={activePage}
            totalPages={totalPages}
            pageSize={itemsPerPage}
            totalItems={filteredQuestions.length}
            itemLabel="questions"
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>

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
