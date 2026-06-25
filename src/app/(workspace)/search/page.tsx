import { Suspense } from "react";
import type { Metadata } from "next";
import {
  getAssessmentCatalogPageData,
  getAssessmentTopics,
} from "@/src/api/assessment.api";
import { getBankTopics } from "@/src/api/bank.api";
import { getQuestionTopics } from "@/src/api/question.api";
import { getBanks } from "@/src/lib/services/banks";
import { getQuestions } from "@/src/lib/services/questions";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";
import { Badge } from "@/src/components/ui/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/ui/card";
import {
  ALL_TOPICS_VALUE,
  assessmentMatchesTopic,
  bankMatchesTopic,
  questionMatchesTopic,
} from "@/src/utils/topic-utils";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Search",
  description: "Search assessments, question banks, and questions across the workspace.",
};

type SearchPageParams = {
  topic?: string | string[];
  search?: string | string[];
};

function getSingleSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function includesQuery(value: string | null | undefined, query: string) {
  return (value ?? "").toLowerCase().includes(query);
}

function getHrefWithSelectedTopic(pathname: string, selectedTopic: string) {
  if (selectedTopic === ALL_TOPICS_VALUE) {
    return pathname;
  }

  const params = new URLSearchParams({ topic: selectedTopic });
  return `${pathname}?${params.toString()}`;
}

function SectionEmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 p-4 text-sm text-inkd">
      No {label} matched this search.
    </div>
  );
}

async function SearchPageContent({
  searchParams,
}: {
  searchParams?: Promise<SearchPageParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = (getSingleSearchParam(resolvedSearchParams?.search) ?? "").trim();
  const selectedTopic =
    getSingleSearchParam(resolvedSearchParams?.topic) ?? ALL_TOPICS_VALUE;
  const normalizedQuery = query.toLowerCase();
  const [assessmentData, banksRes, questionsRes, assessmentTopics, bankTopics, questionTopics] = await Promise.all([
    getAssessmentCatalogPageData(),
    getBanks(1, 100),
    getQuestions(1, 500),
    getAssessmentTopics(),
    getBankTopics(),
    getQuestionTopics(),
  ]);
  const banks = banksRes.data;
  const questions = questionsRes.data;
  const bankMap = Object.fromEntries(
    banks.map((bank) => [bank.id, bank]),
  );
  const filteredAssessments = normalizedQuery
    ? assessmentData.assessments.filter((assessment) => {
        if (
          selectedTopic !== ALL_TOPICS_VALUE &&
          !assessmentMatchesTopic(assessment.id, selectedTopic, assessmentTopics)
        ) {
          return false;
        }

        return (
          includesQuery(assessment.name, normalizedQuery) ||
          includesQuery(assessment.description, normalizedQuery) ||
          includesQuery(assessment.settings?.mode, normalizedQuery) ||
          includesQuery(assessment.status, normalizedQuery)
        );
      })
    : [];
  const filteredBanks = normalizedQuery
    ? banks.filter((bank) => {
        if (
          selectedTopic !== ALL_TOPICS_VALUE &&
          !bankMatchesTopic(bank.id, selectedTopic, bankTopics)
        ) {
          return false;
        }

        return (
          includesQuery(bank.name, normalizedQuery) ||
          includesQuery(bank.description, normalizedQuery)
        );
      })
    : [];
  const filteredQuestions = normalizedQuery
    ? questions.filter((question) => {
        if (
          selectedTopic !== ALL_TOPICS_VALUE &&
          !questionMatchesTopic(question.id, selectedTopic, questionTopics)
        ) {
          return false;
        }

        const bankName = question.topicId ? bankMap[question.topicId]?.name ?? "" : "";

        return (
          includesQuery(question.questionText, normalizedQuery) ||
          includesQuery(question.type, normalizedQuery) ||
          includesQuery(question.difficulty, normalizedQuery) ||
          includesQuery(bankName, normalizedQuery)
        );
      })
    : [];
  const totalResults =
    filteredAssessments.length + filteredBanks.length + filteredQuestions.length;

  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="Search"
        description={
          query
            ? `Showing results for "${query}" across assessments, question banks, and questions.`
            : "Use the topbar search to find assessments, banks, and questions across the workspace."
        }
        meta={
          query ? (
            <Badge variant="info">{totalResults} results</Badge>
          ) : (
            <Badge variant="secondary">Workspace search</Badge>
          )
        }
      />

      {!query ? (
        <StateMessage
          title="Start a workspace search"
          description="Type in the topbar search field to search assessments, question banks, and questions. The search input stays synced with the URL for sharing and reloads."
        />
      ) : totalResults === 0 ? (
        <StateMessage
          title="No matches found"
          description={`No assessments, question banks, or questions matched "${query}". Try a broader keyword or a different phrase.`}
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Assessments</CardTitle>
              <CardDescription>{filteredAssessments.length} matches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredAssessments.length === 0 ? (
                <SectionEmptyState label="assessments" />
              ) : (
                filteredAssessments.map((assessment) => (
                  <Link
                    key={assessment.id}
                    href={getHrefWithSelectedTopic(`/assessments/${assessment.id}`, selectedTopic)}
                    className="block rounded-2xl border border-border/70 bg-white p-4 transition hover:bg-muted/30"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="info">
                        {assessment.settings?.mode === "REAL_TIME" ? "Real-time" : "Self-paced"}
                      </Badge>
                      <Badge variant="secondary">{assessment.status}</Badge>
                    </div>
                    <div className="mt-3 font-semibold text-primary">{assessment.name}</div>
                    <p className="mt-2 text-sm text-inkd">
                      {assessment.description || "No description provided."}
                    </p>
                    <div className="mt-3 text-xs text-inkd">
                      {assessment.settings?.numQuestions || 0} questions
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle>Question Banks</CardTitle>
              <CardDescription>{filteredBanks.length} matches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredBanks.length === 0 ? (
                <SectionEmptyState label="question banks" />
              ) : (
                filteredBanks.map((bank) => (
                  <Link
                    key={bank.id}
                    href={getHrefWithSelectedTopic(`/banks/${bank.id}`, selectedTopic)}
                    className="block rounded-2xl border border-border/70 bg-white p-4 transition hover:bg-muted/30"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="info">{bank.questionCount || 0} questions</Badge>
                    </div>
                    <div className="mt-3 font-semibold text-primary">{bank.name}</div>
                    <p className="mt-2 text-sm text-inkd">{bank.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {bank.tags.map((tag) => (
                        <span
                          key={`${bank.id}-${tag}`}
                          className="rounded-full bg-muted px-2 py-1 text-xs text-inkd"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <CardTitle>Questions</CardTitle>
              <CardDescription>{filteredQuestions.length} matches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredQuestions.length === 0 ? (
                <SectionEmptyState label="questions" />
              ) : (
                filteredQuestions.map((question) => (
                  <Link
                    key={question.id}
                    href={getHrefWithSelectedTopic(`/questions/${question.id}`, selectedTopic)}
                    className="block rounded-2xl border border-border/70 bg-white p-4 transition hover:bg-muted/30"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="info">{question.type}</Badge>
                      <Badge variant="secondary">{question.difficulty}</Badge>
                    </div>
                    <div className="mt-3 line-clamp-3 font-semibold text-primary">
                      {question.questionText}
                    </div>
                    <div className="mt-3 text-xs text-inkd">
                      Bank:{" "}
                      {question.topicId ? bankMap[question.topicId]?.name ?? "Unknown bank" : "Unassigned"}
                      {" | "}
                      {question.points} pts
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<SearchPageParams>;
}) {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <SearchPageContent searchParams={searchParams} />
    </Suspense>
  );
}
