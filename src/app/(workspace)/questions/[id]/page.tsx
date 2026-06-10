import { Suspense } from "react";
import { getQuestionDetail } from "@/src/api/content.api";
import QuestionDetailView from "@/src/components/content/question/detail/QuestionDetailView";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";

async function QuestionDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const question = await getQuestionDetail(id);

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

