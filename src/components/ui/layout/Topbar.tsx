import { getAssessmentTopics } from "@/src/api/assessment.api";
import {
  getBankTopics,
  getQuestionTopics,
  getTopics,
} from "@/src/api/content.api";
import { getTopicOptions } from "@/src/utils/topic-utils";
import TopbarControls from "./TopbarControls";

async function getWorkspaceTopicOptions() {
  "use cache";

  const [topics, bankTopics, questionTopics, assessmentTopics] = await Promise.all([
    getTopics(),
    getBankTopics(),
    getQuestionTopics(),
    getAssessmentTopics(),
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
    <header className="sticky top-0 z-20 w-full border-b border-bdr bg-card px-4 py-3.5 shadow-sm sm:px-6">
      <TopbarControls topicOptions={topicOptions} />
    </header>
  );
}
