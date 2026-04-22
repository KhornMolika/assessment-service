import QuestionsCatalog from "@/src/domains/content/components/question/catalog/QuestionsCatalog";
import {
  getMockQuestionTopics,
  getQuestionCatalogPageData,
} from "@/src/domains/content/api/content.api";

export default async function QuestionsPage() {
  const [{ banks, questions }, questionTopics] = await Promise.all([
    getQuestionCatalogPageData(),
    getMockQuestionTopics(),
  ]);

  return (
    <QuestionsCatalog
      banks={banks}
      initialQuestions={questions}
      questionTopics={questionTopics}
    />
  );
}
