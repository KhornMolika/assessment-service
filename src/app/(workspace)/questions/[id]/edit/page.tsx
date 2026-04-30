import { Suspense } from "react";
import { getMockQuestionEditPageData } from "@/src/domains/content/api/content.api";
import QuestionEditForm from "@/src/domains/content/components/question/edit/QuestionEditForm";
import { WorkspacePageSkeleton } from "@/src/shared/components/layout/PageSkeletons";

async function EditQuestionPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { banks, topics, formData } = await getMockQuestionEditPageData(id);

  return (
    <QuestionEditForm
      questionId={id}
      banks={banks}
      topics={topics}
      initialFormData={formData}
    />
  );
}

export default function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <EditQuestionPageContent params={params} />
    </Suspense>
  );
}
