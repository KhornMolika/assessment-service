
import { getMockBanks } from "@/src/domains/content/api/content.api";
import QuestionBanksCatalog from "@/src/domains/content/components/question-bank/question-bank-catalog/QuestionBanksCatalog";

export default async function BanksPage() {
  const banks = await getMockBanks();

  return <QuestionBanksCatalog banks={banks} />;
}
