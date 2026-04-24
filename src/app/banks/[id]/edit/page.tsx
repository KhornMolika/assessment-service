import { notFound } from "next/navigation";
import { getMockBankById, getMockTopics } from "@/src/domains/content/api/content.api";
import QuestionBankEditForm from "@/src/domains/content/components/question-bank/edit/QuestionBankEditForm";

export default async function EditQuestionBanksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [bank, topics] = await Promise.all([getMockBankById(id), getMockTopics()]);

  if (!bank) {
    notFound();
  }

  return <QuestionBankEditForm bank={bank} topics={topics} />;
}
