import { getMockBanks } from "@/src/domains/content/api/content.api";
import QuestionNewForm from "@/src/domains/content/components/question-new/QuestionNewForm";

export default async function CreateNewQuestionPage() {
  const banks = await getMockBanks();

  return <QuestionNewForm banks={banks} />;
}

