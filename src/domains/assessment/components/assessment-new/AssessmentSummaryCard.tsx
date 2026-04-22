import type { Bank, QuestionCatalogItem } from "@/src/domains/content/types";
import type { NewAssessmentFormData } from "@/src/domains/assessment/types/assessment-form.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/ui/card";

function formatSessionMode(value: NewAssessmentFormData["sessionMode"]) {
  return value === "SELF_PACED" ? "Self-paced" : "Real-time";
}

function formatStatus(value: NewAssessmentFormData["status"]) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function formatParticipantIdentity(value: NewAssessmentFormData["participantIdentity"]) {
  switch (value) {
    case "ANONYMOUS":
      return "Anonymous";
    case "INTERNAL":
      return "Internal";
    default:
      return "External";
  }
}

export default function AssessmentSummaryCard({
  className,
  formData,
  banks,
  questions,
}: {
  className?: string;
  formData: NewAssessmentFormData;
  banks: Bank[];
  questions: QuestionCatalogItem[];
}) {
  const selectedBank = banks.find((bank) => bank.id === formData.selectedBankId);
  const selectedQuestions = questions.filter((question) =>
    formData.selectedQuestionIds.includes(question.id),
  );
  const totalQuestions =
    formData.questionSelection === "MANUAL"
      ? selectedQuestions.length
      : formData.totalQuestions;
  const totalPoints =
    formData.questionSelection === "MANUAL"
      ? selectedQuestions.reduce((sum, question) => sum + question.points, 0)
      : formData.selectionRules.reduce((sum, rule) => sum + rule.count * 3, 0);

  return (
    <Card
      className={`flex flex-col overflow-hidden border-emerald-200 bg-[linear-gradient(180deg,#f5fbf7_0%,#ffffff_70%)] xl:sticky xl:top-6 ${className ?? ""}`}
    >
      <CardHeader>
        <CardDescription className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Assessment Summary
        </CardDescription>
        <CardTitle className="text-2xl">
          {formData.titleEN.trim() || formData.titleKH.trim() || "Untitled assessment"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 overflow-y-auto text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-muted/60 p-3">
            <div className="text-xs uppercase tracking-wide text-inkd">Status</div>
            <div className="mt-1 font-semibold text-primary">{formatStatus(formData.status)}</div>
          </div>
          <div className="rounded-2xl bg-muted/60 p-3">
            <div className="text-xs uppercase tracking-wide text-inkd">Mode</div>
            <div className="mt-1 font-semibold text-primary">{formatSessionMode(formData.sessionMode)}</div>
          </div>
          <div className="rounded-2xl bg-muted/60 p-3">
            <div className="text-xs uppercase tracking-wide text-inkd">Questions</div>
            <div className="mt-1 font-semibold text-primary">{totalQuestions}</div>
          </div>
          <div className="rounded-2xl bg-muted/60 p-3">
            <div className="text-xs uppercase tracking-wide text-inkd">Est. Points</div>
            <div className="mt-1 font-semibold text-primary">{totalPoints}</div>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-inkd">Participant identity</span>
            <span className="font-semibold text-primary">
              {formatParticipantIdentity(formData.participantIdentity)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-inkd">Question strategy</span>
            <span className="font-semibold text-primary">
              {formData.questionSelection === "MANUAL" ? "Manual" : "Dynamic"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-inkd">Selected bank</span>
            <span className="max-w-[60%] text-right font-semibold text-primary">
              {selectedBank?.name ?? "Any bank"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-inkd">Time limit</span>
            <span className="font-semibold text-primary">
              {formData.enableTimeLimit ? `${formData.timeLimitMinutes} min` : "No limit"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-inkd">Pass mark</span>
            <span className="font-semibold text-primary">{formData.passMark}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
