import { Suspense } from "react";
import { getMockQuestionDetail } from "@/src/domains/content/api/content.api";
import QuestionDetailView from "@/src/domains/content/components/question/detail/QuestionDetailView";
import { WorkspacePageSkeleton } from "@/src/shared/components/layout/PageSkeletons";

async function QuestionDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const question = await getMockQuestionDetail(id);

  return <QuestionDetailView question={question} />;
}

export default function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <QuestionDetailPageContent params={params} />
    </Suspense>
  );
}

