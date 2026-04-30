import { Suspense } from "react";
import QuestionsCatalog from "@/src/domains/content/components/question/catalog/QuestionsCatalog";
import {
  getMockQuestionTopics,
  getQuestionCatalogPageData,
} from "@/src/domains/content/api/content.api";
import { WorkspacePageSkeleton } from "@/src/shared/components/layout/PageSkeletons";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Questions',
};

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    { searchParams: { topic: null, query: null, page: null, pageSize: null, bank: null, assessment: null, search: null } },
    { searchParams: { topic: "topic-algebra", query: "quiz", page: "1", pageSize: "10", bank: "bank-1", assessment: "all-assessments", search: "quiz" } },
  ],
};

async function QuestionsPageContent() {
  const [{ banks, questions }, questionTopics] = await Promise.all([
    getQuestionCatalogPageData(),
    getMockQuestionTopics(),
  ]);

  return (
    <QuestionsCatalog
      banks={banks}
      initialQuestions={questions}
      questionTopics={questionTopics}
    />
  );
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <QuestionsPageContent />
    </Suspense>
  );
}
