import QuestionBankNewForm from "@/src/domains/content/components/question-bank/new/QuestionBankNewForm";
import { getMockTopics } from "@/src/domains/content/api/content.api";

export default async function NewQuestionBanksPage() {
  const topics = await getMockTopics();

  return <QuestionBankNewForm topics={topics} />;
}
