import { getMockQuestionEditPageData } from "@/src/domains/content/api/content.api";
import QuestionEditForm from "@/src/domains/content/components/question-edit/QuestionEditForm";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { banks, formData } = await getMockQuestionEditPageData(id);

  return <QuestionEditForm questionId={id} banks={banks} initialFormData={formData} />;
}
