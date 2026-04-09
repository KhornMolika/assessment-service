"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
      <div className="bg-linear-to-br from-[#2D6A4F] via-[#2D6A4F] to-[#40916C] px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="mx-auto flex max-w-5xl items-center">
          <button
            onClick={() => router.push("/questions")}
            className="mb-4 flex items-center gap-2 text-sm text-white/70 transition hover:text-white sm:mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Questions
          </button>
        </div>
      </div>
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
