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

export default async function QuestionsPage() {
  const [{ banks, questions }, questionTopics] = await Promise.all([
    getQuestionCatalogPageData(),
    getMockQuestionTopics(),
  ]);

  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <QuestionsCatalog
        banks={banks}
        initialQuestions={questions}
        questionTopics={questionTopics}
      />
    </Suspense>
  );
}
