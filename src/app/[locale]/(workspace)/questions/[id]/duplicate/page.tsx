import { Suspense } from "react";
import { getQuestionEditPageData } from "@/src/api/question.api";
import QuestionDuplicateForm from "@/src/components/content/question/duplicate/QuestionDuplicateForm";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";

async function DuplicateQuestionPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { banks, topics, formData } = await getQuestionEditPageData(id);

  // Append (Copy) to the original question text
  const duplicateFormData = {
    ...formData,
    questionText: `${formData.questionText} (Copy)`,
  };

  return (
    <QuestionDuplicateForm
      originalQuestionId={id}
      banks={banks}
      topics={topics}
      initialFormData={duplicateFormData}
    />
  );
}

export default function DuplicateQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <DuplicateQuestionPageContent params={params} />
    </Suspense>
  );
}
