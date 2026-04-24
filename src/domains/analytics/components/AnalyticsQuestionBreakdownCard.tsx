import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/src/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/ui/card";
import { StateMessage } from "@/src/shared/components/feedback/StateMessage";
import type { AnalyticsQuestionBreakdown } from "../types/analytics.types";

export default function AnalyticsQuestionBreakdownCard({
  items,
}: {
  items: AnalyticsQuestionBreakdown[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Question answer distribution</CardTitle>
        <CardDescription>
          For each question, see how many participants picked each answer option and which options are correct.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <StateMessage
            title="No question response data found"
            description="No option-based question data is available for the current selection."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] 2xl:grid-cols-4">
            {items.map((item) => {
              const maxPicks = Math.max(...item.optionStats.map((option) => option.picks), 1);

              return (
                <div key={item.id} className="rounded-[24px] border border-border/70 bg-white p-5">
                  <div className="flex flex-col gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{item.assessmentTitle}</Badge>
                        <Badge variant="info">{item.questionType}</Badge>
                      </div>
                      <h3 className="text-base font-semibold text-primary">{item.questionText}</h3>
                      <p className="text-sm text-inkd">
                        {item.responseCount} responses, {item.correctResponseCount} fully correct
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {item.optionStats.map((option) => (
                      <div key={option.id} className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-2">
                            {option.isCorrect ? (
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
                            ) : (
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-border" />
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-primary">{option.label}</p>
                              {option.isCorrect ? (
                                <p className="text-xs text-green-700">Correct option</p>
                              ) : null}
                            </div>
                          </div>
                          <div className="shrink-0 text-sm font-semibold text-primary">
                            {option.picks} picks
                          </div>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-muted">
                          <div
                            className={
                              option.isCorrect
                                ? "h-full rounded-full bg-green-600"
                                : "h-full rounded-full bg-primary"
                            }
                            style={{
                              width: `${Math.max(
                                (option.picks / maxPicks) * 100,
                                option.picks > 0 ? 10 : 0,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
