import { notFound } from "next/navigation";
import { getMockBankById } from "@/src/domains/content/api/content.api";
import QuestionBankEditForm from "@/src/domains/content/components/question-bank/question-bank-edit/QuestionBankEditForm";

export default async function EditQuestionBanksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bank = await getMockBankById(id);

  if (!bank) {
    notFound();
  }

  return <QuestionBankEditForm bank={bank} />;
}
