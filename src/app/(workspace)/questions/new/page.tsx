import { Suspense } from "react";
import { getBanks, getTopics } from "@/src/api/content.api";
import QuestionNewForm from "@/src/components/content/question/new/QuestionNewForm";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";

async function CreateNewQuestionPageContent() {
  const [banks, topics] = await Promise.all([getBanks(), getTopics()]);

  return <QuestionNewForm banks={banks} topics={topics} />;
}

export default function CreateNewQuestionPage() {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <CreateNewQuestionPageContent />
    </Suspense>
  );
}


