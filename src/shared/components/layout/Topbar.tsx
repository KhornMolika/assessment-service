import { getMockAssessmentTopics } from "@/src/domains/assessment/api/assessment.api";
import {
  getMockBankTopics,
  getMockQuestionTopics,
  getMockTopics,
} from "@/src/domains/content/api/content.api";
import { getTopicOptions } from "@/src/domains/content/utils/topic-utils";
import TopbarControls from "./TopbarControls";

async function getWorkspaceTopicOptions() {
  const [topics, bankTopics, questionTopics, assessmentTopics] = await Promise.all([
    getMockTopics(),
    getMockBankTopics(),
    getMockQuestionTopics(),
    getMockAssessmentTopics(),
  ]);

  return getTopicOptions({
    topics,
    bankTopics,
    questionTopics,
    assessmentTopics,
  }).map((topic) => ({
    id: topic.id,
    name: topic.name,
  }));
}

export default async function Topbar() {
  const topicOptions = await getWorkspaceTopicOptions();

  return (
    <header className="sticky top-0 z-20 w-full border-b border-bdr bg-card px-4 py-3 shadow-sm sm:px-6">
      <TopbarControls topicOptions={topicOptions} />
    </header>
  );
}
