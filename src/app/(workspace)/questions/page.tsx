import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import {
  getQuestionTopics,
  getQuestionCatalogPageData,
} from "@/src/api/content.api";
import QuestionBuilderAction from "@/src/components/content/question/catalog/QuestionBuilderAction";
import QuestionsCatalogToolbar from "@/src/components/content/question/catalog/QuestionsCatalogToolbar";
import QuestionsTableInteractive from "@/src/components/content/question/catalog/QuestionsTableInteractive";
import type { Bank } from "@/src/types/bank.types";
import type { QuestionCatalogItem } from "@/src/types/question-catalog.types";
import type { QuestionTopicMap } from "@/src/types/topic.types";
import {
  ALL_TOPICS_VALUE,
  questionMatchesTopic,
} from "@/src/utils/topic-utils";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";
import LinkPagination from "@/src/components/ui/navigation/LinkPagination";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/ui/card";

export const metadata: Metadata = {
  title: "Questions",
};

type QuestionSearchParams = Promise<{
  topic?: string | string[];
  query?: string | string[];
  page?: string | string[];
  pageSize?: string | string[];
  type?: string | string[];
  bank?: string | string[];
}>;

function getSingleSearchParam(
  value: string | string[] | undefined,
  fallback = "",
) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function parsePositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function filterQuestions({
  questions,
  banks,
  questionTopics,
  query,
  typeFilter,
  bankFilter,
  topicFilter,
}: {
  questions: QuestionCatalogItem[];
  banks: Bank[];
  questionTopics: QuestionTopicMap[];
  query: string;
  typeFilter: string;
  bankFilter: string;
  topicFilter: string;
}) {
  const normalizedQuery = query.trim().toLowerCase();
  const bankMap = Object.fromEntries(banks.map((bank) => [bank.id, bank]));

  return questions.filter((question) => {
    const bankName = question.bank_id
      ? bankMap[question.bank_id]?.name ?? "Unknown bank"
      : "Unassigned";

    if (normalizedQuery && !question.text.toLowerCase().includes(normalizedQuery)) {
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
}

async function QuestionsPageContent({
  searchParams,
}: {
  searchParams: QuestionSearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const topicFilter =
    getSingleSearchParam(resolvedSearchParams.topic, ALL_TOPICS_VALUE) ||
    ALL_TOPICS_VALUE;
  const query = getSingleSearchParam(resolvedSearchParams.query);
  const typeFilter = getSingleSearchParam(resolvedSearchParams.type, "All Types") || "All Types";
  const bankFilter = getSingleSearchParam(resolvedSearchParams.bank, "All Banks") || "All Banks";
  const currentPage = parsePositiveInteger(getSingleSearchParam(resolvedSearchParams.page), 1);
  const itemsPerPage = parsePositiveInteger(getSingleSearchParam(resolvedSearchParams.pageSize), 10);
  const [{ banks, questions }, questionTopics] = await Promise.all([
    getQuestionCatalogPageData(),
    getQuestionTopics(),
  ]);
  const filteredQuestions = filterQuestions({
    questions,
    banks,
    questionTopics,
    query,
    typeFilter,
    bankFilter,
    topicFilter,
  });
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedQuestions = filteredQuestions.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage,
  );
  const availableTypes = Array.from(new Set(questions.map((question) => question.type))).sort();
  const availableBanks = banks.map((bank) => bank.name);
  const hasActiveFilters =
    query.trim().length > 0 ||
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
            <QuestionBuilderAction />
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

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <CardTitle>Question catalog</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-0 pb-0 sm:px-0 sm:pb-0">
          <QuestionsCatalogToolbar
            availableTypes={availableTypes}
            availableBanks={availableBanks}
            typeFilter={typeFilter}
            bankFilter={bankFilter}
          />
          <div className={filteredQuestions.length === 0 ? "px-4 pb-4 sm:px-6 sm:pb-6" : undefined}>
            {filteredQuestions.length === 0 ? (
              <StateMessage
                title={hasActiveFilters ? "No questions found" : "No questions available"}
                description={
                  hasActiveFilters
                    ? "No questions match the current search, bank, topic, and type filters."
                    : "Questions will appear here after they are added to one or more banks."
                }
                action={
                  hasActiveFilters ? (
                    <Link
                      href="/questions"
                      className="inline-flex items-center justify-center rounded-2xl border border-border bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
                    >
                      Clear filters
                    </Link>
                  ) : null
                }
              />
            ) : (
              <QuestionsTableInteractive questions={paginatedQuestions} banks={banks} />
            )}
          </div>
        </CardContent>
        {filteredQuestions.length > 0 ? (
          <LinkPagination
            pathname="/questions"
            searchParams={{
              topic: topicFilter === ALL_TOPICS_VALUE ? null : topicFilter,
              query: query || null,
              type: typeFilter === "All Types" ? null : typeFilter,
              bank: bankFilter === "All Banks" ? null : bankFilter,
              pageSize: itemsPerPage === 10 ? null : String(itemsPerPage),
            }}
            currentPage={activePage}
            totalPages={totalPages}
            pageSize={itemsPerPage}
            defaultPageSize={10}
            totalItems={filteredQuestions.length}
            itemLabel="questions"
          />
        ) : null}
      </Card>
    </div>
  );
}

export default function QuestionsPage({
  searchParams,
}: {
  searchParams: QuestionSearchParams;
}) {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <QuestionsPageContent searchParams={searchParams} />
    </Suspense>
  );
}
