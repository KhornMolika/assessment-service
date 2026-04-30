"use client";

import { useRouter } from "next/navigation";
import { createMockQuestionDuplicateId } from "@/src/domains/content/api/content.api";
import type { QuestionDetailData } from "@/src/domains/content/types/question-detail.types";
import QuestionDetailHero from "./QuestionDetailHero";
import QuestionPreviewCard from "./QuestionPreviewCard";
import QuestionSidebar from "./QuestionSidebar";

export default function QuestionDetailView({ question }: { question: QuestionDetailData }) {
  const router = useRouter();

  const handleDuplicate = () => {
    const duplicateId = createMockQuestionDuplicateId(question.id);
    router.push(`/questions/${duplicateId}`);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F7FAF8_0%,#FFFFFF_30%,#F6FAF7_100%)]">
      <QuestionDetailHero question={question} />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="space-y-6">
          <QuestionSidebar question={question} onDuplicate={handleDuplicate} />
          <QuestionPreviewCard question={question} />
        </div>
      </div>
    </div>
  );
}
