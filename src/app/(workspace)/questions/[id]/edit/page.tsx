import { Suspense } from "react";
import { getQuestionEditPageData } from "@/src/api/question.api";
import QuestionEditForm from "@/src/components/content/question/edit/QuestionEditForm";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";

async function EditQuestionPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { banks, topics, formData } = await getQuestionEditPageData(id);

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
