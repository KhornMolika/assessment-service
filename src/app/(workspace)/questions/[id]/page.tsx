import { Suspense } from "react";
import { getQuestionDetail } from "@/src/components/content/api/content.api";
import QuestionDetailView from "@/src/components/content/components/question/detail/QuestionDetailView";
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

