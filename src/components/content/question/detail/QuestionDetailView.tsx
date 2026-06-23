"use client";

import type { ApiQuestionResponse } from "@/src/types/question-detail.types";
import QuestionDetailHero from "./QuestionDetailHero";
import QuestionDetailsCard from "./QuestionDetailsCard";
import QuestionOptionsAndAnswers from "./QuestionOptionsAndAnswers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/ui/card";

export default function QuestionDetailView({ question }: { question: ApiQuestionResponse }) {
  return (
    <div>
      <QuestionDetailHero question={question} />

      <div className="w-full">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_350px]">
          {/* Main Content Area */}
          <div className="flex flex-col gap-6">
            <Card className="flex-1 shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl pb-4">
                <CardTitle className="text-lg text-slate-800">Answers & Configuration</CardTitle>
                <CardDescription>Details on expected answers and formatting options.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-6 pb-6 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-black text-indigo-300 mt-0.5">Q.</span>
                    <p className="flex-1 text-[15px] font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {question.questionText}
                    </p>
                  </div>
                </div>
                <QuestionOptionsAndAnswers question={question} />
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar Area */}
          <div className="flex flex-col gap-6">
            <QuestionDetailsCard question={question} />
          </div>
        </div>
      </div>
    </div>
  );
}
