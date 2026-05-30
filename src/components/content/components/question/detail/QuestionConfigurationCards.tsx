import type { QuestionDetailData } from "@/src/types/question-detail.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/ui/card";

export default function QuestionConfigurationCards({ question }: { question: QuestionDetailData }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Question Type Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-muted p-4">
              <div className="mb-1 text-xs uppercase text-gray-600">Grading Strategy</div>
              <div className="wrap-break-word text-sm font-bold text-primary">{question.type.grading_strategy}</div>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <div className="mb-1 text-xs uppercase text-gray-600">Max Score</div>
              <div className="text-sm font-bold text-primary">{question.type.default_max_score}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {question.type.has_options && <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Has Options</span>}
            {question.type.supports_ai && <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">AI Gradable</span>}
            {question.type.is_manual_only && <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">Manual Only</span>}
          </div>

          <div>
            <div className="mb-2 text-xs uppercase text-gray-600">Type Description</div>
            <p className="text-sm text-inkd">{question.type.description}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Question Settings (JSONB)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(question.settings).map(([key, value]) => (
            <div key={key} className="flex flex-col gap-1 border-b border-gray-100 py-2 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <span className="text-sm font-medium text-inkd">{key.replace(/([A-Z])/g, " $1").trim()}</span>
              <span className="wrap-break-words text-sm font-bold text-primary">{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {question.type.supports_ai && (
        <Card>
          <CardHeader>
            <CardTitle>AI Grading Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            {question.ai_grading_config ? (
              <div className="space-y-4">
                <div>
                  <div className="mb-2 text-xs uppercase text-gray-600">Mode</div>
                  <div className="text-sm font-bold text-primary">{question.ai_grading_config.mode}</div>
                </div>
                <div>
                  <div className="mb-2 text-xs uppercase text-gray-600">Max Score</div>
                  <div className="text-sm font-bold text-primary">{question.ai_grading_config.max_score}</div>
                </div>
                <div>
                  <div className="mb-2 text-xs uppercase text-gray-600">Instruction</div>
                  <p className="text-sm text-inkd">{question.ai_grading_config.instruction}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-inkd">No AI grading configuration set for this question.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
