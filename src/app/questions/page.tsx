import QuestionsCatalog from "@/src/domains/content/components/question/catalog/QuestionsCatalog";
import { getQuestionCatalogPageData } from "@/src/domains/content/api/content.api";

export default async function QuestionsPage() {
  const { banks, questions } = await getQuestionCatalogPageData();

  return <QuestionsCatalog banks={banks} initialQuestions={questions} />;
}

