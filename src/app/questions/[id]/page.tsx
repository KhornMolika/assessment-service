import { getMockQuestionDetail } from "@/src/domains/content/api/content.api";
import QuestionDetailView from "@/src/domains/content/components/question-detail/QuestionDetailView";

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const question = await getMockQuestionDetail(id);

  return <QuestionDetailView question={question} />;
}
