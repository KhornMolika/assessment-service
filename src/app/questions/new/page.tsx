import { getMockBanks, getMockTopics } from "@/src/domains/content/api/content.api";
import QuestionNewForm from "@/src/domains/content/components/question/new/QuestionNewForm";

export default async function CreateNewQuestionPage() {
  const [banks, topics] = await Promise.all([getMockBanks(), getMockTopics()]);

  return <QuestionNewForm banks={banks} topics={topics} />;
}


