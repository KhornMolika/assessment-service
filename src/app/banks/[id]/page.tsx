import { notFound } from "next/navigation";
import { getMockBankDetailPageData } from "@/src/domains/content/api/content.api";
import QuestionBankDetailView from "@/src/domains/content/components/question-bank/question-bank-detail/QuestionBankDetailView";

export default async function QuestionBanksDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { bank, recentQuestions } = await getMockBankDetailPageData(id);

  if (!bank) {
    notFound();
  }

  return <QuestionBankDetailView bank={bank} recentQuestions={recentQuestions} />;
}
