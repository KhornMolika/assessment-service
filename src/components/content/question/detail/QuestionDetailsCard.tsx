import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/ui/card";
import { Clock, Hash, HelpCircle, Layers, Star, Calendar } from "lucide-react";
import type { ApiQuestionResponse } from "@/src/types/question-detail.types";

export default function QuestionDetailsCard({ question }: { question: ApiQuestionResponse }) {
  // Format dates
  const createdDate = new Date(question.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const updatedDate = new Date(question.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Topic */}
        <div className="flex items-center gap-3">
          <Layers className="h-5 w-5 text-primary" />
          <div>
            <div className="text-xs font-medium text-slate-500">Topic</div>
            <div className="text-sm font-medium text-slate-900">
              {question.topic?.name || "No Topic"}
            </div>
          </div>
        </div>

        {/* Type */}
        <div className="flex items-center gap-3">
          <HelpCircle className="h-5 w-5 text-blue-500" />
          <div>
            <div className="text-xs font-medium text-slate-500">Type</div>
            <div className="text-sm font-medium text-slate-900">
              {question.type.replace(/_/g, " ")}
            </div>
          </div>
        </div>

        {/* Difficulty */}
        <div className="flex items-center gap-3">
          <Star className="h-5 w-5 text-yellow-500" />
          <div>
            <div className="text-xs font-medium text-slate-500">Difficulty</div>
            <div className="text-sm font-medium text-slate-900 capitalize">
              {question.difficulty.toLowerCase()}
            </div>
          </div>
        </div>

        {/* Points */}
        <div className="flex items-center gap-3">
          <Hash className="h-5 w-5 text-green-500" />
          <div>
            <div className="text-xs font-medium text-slate-500">Points</div>
            <div className="text-sm font-medium text-slate-900">
              {question.points}
            </div>
          </div>
        </div>

        {/* Created At */}
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-slate-400" />
          <div>
            <div className="text-xs font-medium text-slate-500">Created At</div>
            <div className="text-sm font-medium text-slate-900">
              {createdDate}
            </div>
          </div>
        </div>

        {/* Updated At */}
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-slate-400" />
          <div>
            <div className="text-xs font-medium text-slate-500">Updated At</div>
            <div className="text-sm font-medium text-slate-900">
              {updatedDate}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
