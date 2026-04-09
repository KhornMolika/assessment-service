import type { QuestionDetailData } from "@/src/domains/content/types/question-detail.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/shared/components/ui/card";

export default function QuestionPerformanceCard({ question }: { question: QuestionDetailData }) {
  const successRate = Math.round((question.stats.correctAnswers / question.stats.totalAttempts) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          <div className="rounded-lg bg-muted p-4">
            <div className="mb-1 text-xs uppercase text-gray-600">Total Attempts</div>
            <div className="text-2xl font-bold text-primary sm:text-3xl">{question.stats.totalAttempts}</div>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <div className="mb-1 text-xs uppercase text-gray-600">Average Score</div>
            <div className="text-2xl font-bold text-primary sm:text-3xl">{question.stats.averageScore}%</div>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <div className="mb-1 text-xs uppercase text-gray-600">Correct Answers</div>
            <div className="text-2xl font-bold text-primary sm:text-3xl">{question.stats.correctAnswers}</div>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <div className="mb-1 text-xs uppercase text-gray-600">Success Rate</div>
            <div className="text-2xl font-bold text-primary sm:text-3xl">{successRate}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
