import { getMockBankTopics, getMockBanks } from "@/src/domains/content/api/content.api";
import QuestionBanksCatalog from "@/src/domains/content/components/question-bank/catalog/QuestionBanksCatalog";

export default async function BanksPage() {
  const [banks, bankTopics] = await Promise.all([getMockBanks(), getMockBankTopics()]);

  return <QuestionBanksCatalog banks={banks} bankTopics={bankTopics} />;
}
