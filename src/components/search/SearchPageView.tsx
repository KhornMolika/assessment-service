"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/src/components/ui/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/ui/card";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import { getHrefWithTopic } from "@/src/hooks/use-global-topic-filter";
import type { AssessmentCatalogItem } from "@/src/types/assessment-catalog.types";
import type { Bank } from "@/src/types/bank.types";
import type { QuestionCatalogItem } from "@/src/types/question-catalog.types";
import type {
  AssessmentTopicMap,
  BankTopicMap,
  QuestionTopicMap,
} from "@/src/types/topic.types";
import {
  ALL_TOPICS_VALUE,
  assessmentMatchesTopic,
  bankMatchesTopic,
  questionMatchesTopic,
} from "@/src/utils/topic-utils";

function includesQuery(value: string | null | undefined, query: string) {
  return (value ?? "").toLowerCase().includes(query);
}

function SectionEmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 p-4 text-sm text-inkd">
      No {label} matched this search.
    </div>
  );
}

export default function SearchPageView({
  assessments,
  banks,
  questions,
  assessmentTopics,
  bankTopics,
  questionTopics,
}: {
  assessments: AssessmentCatalogItem[];
  banks: Bank[];
  questions: QuestionCatalogItem[];
  assessmentTopics: AssessmentTopicMap[];
  bankTopics: BankTopicMap[];
  questionTopics: QuestionTopicMap[];
}) {
  const searchParams = useSearchParams();
  const query = (searchParams.get("search") ?? "").trim();
  const selectedTopic = searchParams.get("topic") ?? ALL_TOPICS_VALUE;
  const normalizedQuery = query.toLowerCase();
  const bankMap = useMemo(
    () => Object.fromEntries(banks.map((bank) => [bank.id, bank])),
    [banks],
  );

  const filteredAssessments = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return assessments.filter((assessment) => {
      if (
        selectedTopic !== ALL_TOPICS_VALUE &&
        !assessmentMatchesTopic(assessment.id, selectedTopic, assessmentTopics)
      ) {
        return false;
      }

      return (
        includesQuery(assessment.title, normalizedQuery) ||
        includesQuery(assessment.description, normalizedQuery) ||
        includesQuery(assessment.question_bank_name, normalizedQuery) ||
        includesQuery(assessment.delivery_mode, normalizedQuery) ||
        includesQuery(assessment.lifecycle, normalizedQuery)
      );
    });
  }, [assessmentTopics, assessments, normalizedQuery, selectedTopic]);

  const filteredBanks = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return banks.filter((bank) => {
      if (
        selectedTopic !== ALL_TOPICS_VALUE &&
        !bankMatchesTopic(bank.id, selectedTopic, bankTopics)
      ) {
        return false;
      }

      return (
        includesQuery(bank.name, normalizedQuery) ||
        includesQuery(bank.description, normalizedQuery) ||
        includesQuery(bank.visibility, normalizedQuery) ||
        bank.tags.some((tag) => includesQuery(tag, normalizedQuery))
      );
    });
  }, [bankTopics, banks, normalizedQuery, selectedTopic]);

  const filteredQuestions = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return questions.filter((question) => {
      if (
        selectedTopic !== ALL_TOPICS_VALUE &&
        !questionMatchesTopic(question.id, selectedTopic, questionTopics)
      ) {
        return false;
      }

      const bankName = question.bank_id ? bankMap[question.bank_id]?.name ?? "" : "";

      return (
        includesQuery(question.text, normalizedQuery) ||
        includesQuery(question.type, normalizedQuery) ||
        includesQuery(question.difficulty, normalizedQuery) ||
        includesQuery(question.language, normalizedQuery) ||
        includesQuery(bankName, normalizedQuery) ||
        question.tags.some((tag) => includesQuery(tag, normalizedQuery))
      );
    });
  }, [bankMap, normalizedQuery, questionTopics, questions, selectedTopic]);

  const totalResults =
    filteredAssessments.length + filteredBanks.length + filteredQuestions.length;

  return (
    <div className="space-y-6 p-4">
      <PageHeaderCard
        title="Search"
        description={
          query
            ? `Showing results for "${query}" across assessments, question banks, and questions.`
            : "Use the topbar search to find assessments, banks, and questions across the workspace."
        }
        meta={
          query ? (
            <>
              <Badge variant="info">{totalResults} results</Badge>
            </>
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
                    href={getHrefWithTopic(`/assessments/${assessment.id}`, selectedTopic)}
                    className="block rounded-2xl border border-border/70 bg-white p-4 transition hover:bg-muted/30"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="info">
                        {assessment.delivery_mode === "REAL_TIME" ? "Real-time" : "Self-paced"}
                      </Badge>
                      <Badge variant="secondary">{assessment.lifecycle}</Badge>
                    </div>
                    <div className="mt-3 font-semibold text-primary">{assessment.title}</div>
                    <p className="mt-2 text-sm text-inkd">
                      {assessment.description || "No description provided."}
                    </p>
                    <div className="mt-3 text-xs text-inkd">
                      Bank: {assessment.question_bank_name} | {assessment.question_count} questions
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
                    href={getHrefWithTopic(`/banks/${bank.id}`, selectedTopic)}
                    className="block rounded-2xl border border-border/70 bg-white p-4 transition hover:bg-muted/30"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{bank.visibility}</Badge>
                      <Badge variant="info">{bank.question_count} questions</Badge>
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
                    href={getHrefWithTopic(`/questions/${question.id}`, selectedTopic)}
                    className="block rounded-2xl border border-border/70 bg-white p-4 transition hover:bg-muted/30"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="info">{question.type}</Badge>
                      <Badge variant="secondary">{question.difficulty}</Badge>
                    </div>
                    <div className="mt-3 line-clamp-3 font-semibold text-primary">
                      {question.text}
                    </div>
                    <div className="mt-3 text-xs text-inkd">
                      Bank:{" "}
                      {question.bank_id ? bankMap[question.bank_id]?.name ?? "Unknown bank" : "Unassigned"}
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
