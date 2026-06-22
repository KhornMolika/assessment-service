import { fetchTopics } from "@/src/actions/topic-actions";
import { TopicsClient } from "./topics-client";

export default async function TopicsPage() {
  const topics = await fetchTopics();

  return <TopicsClient initialTopics={topics} />;
}
