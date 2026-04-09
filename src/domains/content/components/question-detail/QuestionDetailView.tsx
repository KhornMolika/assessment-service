"use client";

import { useRouter } from "next/navigation";
import { createMockQuestionDuplicateId } from "@/src/domains/content/api/content.api";
import type { QuestionDetailData } from "@/src/domains/content/types/question-detail.types";
import QuestionConfigurationCards from "./QuestionConfigurationCards";
import QuestionDetailHero from "./QuestionDetailHero";
import QuestionPerformanceCard from "./QuestionPerformanceCard";
import QuestionPreviewCard from "./QuestionPreviewCard";
import QuestionSidebar from "./QuestionSidebar";

export default function QuestionDetailView({ question }: { question: QuestionDetailData }) {
  const router = useRouter();

  const handleDuplicate = () => {
    const duplicateId = createMockQuestionDuplicateId(question.id);
    router.push(`/questions/${duplicateId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <QuestionDetailHero question={question} onDuplicate={handleDuplicate} />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <QuestionPreviewCard question={question} />
            <QuestionConfigurationCards question={question} />
            <QuestionPerformanceCard question={question} />
          </div>
          <QuestionSidebar question={question} onDuplicate={handleDuplicate} />
        </div>
      </div>
    </div>
  );
}
