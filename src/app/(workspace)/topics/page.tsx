import type { Metadata } from "next";
import { getMockAssessmentTopics } from "@/src/domains/assessment/api/assessment.api";
import {
  getMockBankTopics,
  getMockQuestionTopics,
  getMockTopics,
} from "@/src/domains/content/api/content.api";
import TopicsManager from "@/src/domains/content/components/topic/TopicsManager";
import type { Topic } from "@/src/domains/content/types";
import { PageHeaderCard } from "@/src/shared/components/layout/PageHeaderCard";
import { Badge } from "@/src/shared/components/ui/badge";

export const metadata: Metadata = {
  title: "Topics",
};

function getTopicUsage({
  topic,
  bankTopicIds,
  questionTopicIds,
  assessmentTopicIds,
}: {
  topic: Topic;
  bankTopicIds: Map<string, number>;
  questionTopicIds: Map<string, number>;
  assessmentTopicIds: Map<string, number>;
}) {
  return {
    banks: bankTopicIds.get(topic.id) ?? 0,
    questions: questionTopicIds.get(topic.id) ?? 0,
    assessments: assessmentTopicIds.get(topic.id) ?? 0,
  };
}

function countByTopic(topicIds: string[]) {
  return topicIds.reduce((counts, topicId) => {
    counts.set(topicId, (counts.get(topicId) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());
}

export default async function TopicsPage() {
  const [topics, bankTopics, questionTopics, assessmentTopics] = await Promise.all([
    getMockTopics(),
    getMockBankTopics(),
    getMockQuestionTopics(),
    getMockAssessmentTopics(),
  ]);
  const bankTopicIds = countByTopic(bankTopics.map((item) => item.topic_id));
  const questionTopicIds = countByTopic(questionTopics.map((item) => item.topic_id));
  const assessmentTopicIds = countByTopic(assessmentTopics.map((item) => item.topic_id));
  const topicsWithUsage = topics
    .map((topic) => ({
      ...topic,
      usage: getTopicUsage({
        topic,
        bankTopicIds,
        questionTopicIds,
        assessmentTopicIds,
      }),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));

  return (
    <div className="space-y-6 p-4">
      <PageHeaderCard
        title="Topics"
        description="Manage workspace taxonomy used by question banks, reusable questions, assessments, and topbar filtering."
        meta={<Badge variant="secondary">Workspace taxonomy</Badge>}
      />
      <TopicsManager topics={topicsWithUsage} />
    </div>
  );
}
