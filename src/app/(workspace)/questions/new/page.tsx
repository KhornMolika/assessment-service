import { Suspense } from "react";
import { getMockBanks, getMockTopics } from "@/src/domains/content/api/content.api";
import QuestionNewForm from "@/src/domains/content/components/question/new/QuestionNewForm";
import { WorkspacePageSkeleton } from "@/src/shared/components/layout/PageSkeletons";

async function CreateNewQuestionPageContent() {
  const [banks, topics] = await Promise.all([getMockBanks(), getMockTopics()]);

  return <QuestionNewForm banks={banks} topics={topics} />;
}

export default function CreateNewQuestionPage() {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <CreateNewQuestionPageContent />
    </Suspense>
  );
}


