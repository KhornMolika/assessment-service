"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { fetchTopicQuestions, fetchGlobalQuestions } from "@/src/actions/question-actions";
import { fetchGlobalBanks } from "@/src/actions/bank-actions";
import { fetchTopics } from "@/src/actions/topic-actions";
import QuestionBuilderAction from "@/src/components/content/question/catalog/QuestionBuilderAction";
import QuestionsCatalogToolbar from "@/src/components/content/question/catalog/QuestionsCatalogToolbar";
import QuestionsTableInteractive from "@/src/components/content/question/catalog/QuestionsTableInteractive";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { QuestionBank, Question } from "@/src/types/api";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";
import Pagination from "@/src/components/ui/navigation/Pagination";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/ui/card";
import { useTopicStore } from "@/src/stores/topic-store";
import { useSearchParams } from "next/navigation";

// Utility functions
function getSingleSearchParam(value: string | string[] | null | undefined, fallback = "") {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

function parsePositiveInteger(value: string | null | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return parsed;
}

function filterQuestions({
  questions,
  query,
  typeFilter,
  difficultyFilter,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  questions: any[];
  query: string;
  typeFilter: string;
  difficultyFilter: string;
}) {
  const normalizedQuery = query.trim().toLowerCase();
  return questions.filter((question) => {
    if (normalizedQuery && !question.questionText?.toLowerCase().includes(normalizedQuery)) return false;
    if (typeFilter !== "All Types" && question.type !== typeFilter) return false;
    if (difficultyFilter !== "All Difficulties" && question.difficulty?.toUpperCase() !== difficultyFilter.toUpperCase()) return false;
    return true;
  });
}

export function QuestionsPageContent() {
  const searchParams = useSearchParams();
  const query = getSingleSearchParam(searchParams.get("query"));
  const typeFilter = getSingleSearchParam(searchParams.get("type"), "All Types") || "All Types";
  const difficultyFilter = getSingleSearchParam(searchParams.get("difficulty"), "All Difficulties") || "All Difficulties";
  const currentPage = parsePositiveInteger(searchParams.get("page"), 1);
  const itemsPerPage = parsePositiveInteger(searchParams.get("pageSize"), 10);
  
  const activeTopic = useTopicStore((s) => s.activeTopic);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [questions, setQuestions] = useState<any[]>([]);
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [topics, setTopics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchResources() {
      setIsLoading(true);
      try {
        const [fetchedBanks, fetchedTopics] = await Promise.all([
          fetchGlobalBanks(),
          fetchTopics()
        ]);
        if (isMounted) {
          setBanks(fetchedBanks || []);
          setTopics(fetchedTopics || []);
        }

        let fetchedQuestions;
        if (activeTopic === null) {
          fetchedQuestions = await fetchGlobalQuestions();
        } else {
          fetchedQuestions = await fetchTopicQuestions(activeTopic.id);
        }

        if (isMounted) {
          setQuestions(fetchedQuestions);
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchResources();
    return () => { isMounted = false };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTopic?.id ?? 'all']);

  if (isLoading) {
    return <WorkspacePageSkeleton />;
  }

  const filteredQuestions = filterQuestions({
    questions,
    query,
    typeFilter,
    difficultyFilter,
  });
  
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedQuestions = filteredQuestions.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage,
  );
  
  const availableTypes = Array.from(new Set(questions.map((q) => q.type))).filter(Boolean).sort() as string[];
  const hasActiveFilters = query.trim().length > 0 || typeFilter !== "All Types" || difficultyFilter !== "All Difficulties";

  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="Questions"
        description={`${questions.length} reusable questions ${activeTopic ? `in ${activeTopic.name}` : "across all topics"}.`}
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

      <Card className="overflow-hidden embed-transparent-card">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <CardTitle>Question catalog</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-0 pb-0 sm:px-0 sm:pb-0">
          <QuestionsCatalogToolbar
            availableTypes={availableTypes}
            typeFilter={typeFilter}
            difficultyFilter={difficultyFilter}
          />
          <div className={filteredQuestions.length === 0 ? "px-4 pb-4 sm:px-6 sm:pb-6" : undefined}>
            {filteredQuestions.length === 0 ? (
              <StateMessage
                title={hasActiveFilters ? "No questions found" : "No questions available"}
                description={
                  hasActiveFilters
                    ? "No questions match the current search, bank, topic, and type filters."
                    : "Questions will appear here after they are added."
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
              <QuestionsTableInteractive
                questions={paginatedQuestions}
                banks={banks}
                topics={topics}
              />
            )}
          </div>
        </CardContent>
        {filteredQuestions.length > 0 ? (
          <Pagination
            pathname="/questions"
            searchParams={{
              query: query || null,
              type: typeFilter === "All Types" ? null : typeFilter,
              difficulty: difficultyFilter === "All Difficulties" ? null : difficultyFilter,
              pageSize: itemsPerPage === 10 ? null : String(itemsPerPage),
            }}
            currentPage={activePage}
            totalPages={totalPages}
            pageSize={itemsPerPage}
            defaultPageSize={10}
            totalItems={filteredQuestions.length}
            pageSizeOptions={[5, 10, 20, 50]}
            itemLabel="questions"
          />
        ) : null}
      </Card>
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <QuestionsPageContent />
    </Suspense>
  );
}
