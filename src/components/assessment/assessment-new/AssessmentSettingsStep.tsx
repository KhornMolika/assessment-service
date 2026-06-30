"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Clock3, Plus, Sparkles, TimerReset, Trash2, ChevronDown } from "lucide-react";
import type { NewAssessmentFormData } from "@/src/types/assessment-form.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/ui/card";
import { Button } from "@/src/components/ui/ui/button";
import { Label } from "@/src/components/ui/ui/label";
import { Input } from "@/src/components/ui/ui/input";
import { DropdownSelect } from "@/src/components/ui/ui/dropdown-select";

export default function AssessmentSettingsStep({
  formData,
  onChange,
  onGradeLabelChange,
  onAddGradeLabel,
  onRemoveGradeLabel,
  publishedScheduleOnly = false,
}: {
  formData: NewAssessmentFormData;
  onChange: <K extends keyof NewAssessmentFormData>(
    field: K,
    value: NewAssessmentFormData[K],
  ) => void;
  onGradeLabelChange: (
    index: number,
    field: "grade" | "minPercent",
    value: string | number,
  ) => void;
  onAddGradeLabel: () => void;
  onRemoveGradeLabel: (index: number) => void;
  publishedScheduleOnly?: boolean;
}) {
  if (publishedScheduleOnly) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-5 py-4 text-sm font-medium leading-relaxed text-emerald-900">
          This assessment is already published. Core details, participant rules, scoring, and questions are locked; only the schedule below can be updated.
        </div>

        <Card className="border-emerald-200/80 bg-white shadow-sm">
          <CardHeader className="rounded-t-2xl border-b border-emerald-100 bg-[linear-gradient(135deg,#f2fbf4_0%,#ffffff_100%)] dark:bg-card dark:bg-none">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Clock3 className="h-5 w-5" />
              </span>
              <div>
                <CardTitle className="text-lg text-[#14352b]">Published Schedule</CardTitle>
                <CardDescription>
                  Adjust when learners can access this assessment.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="timeLimitMinutes" className="text-sm font-bold text-slate-800">Time limit (minutes)</Label>
                <Input
                  id="timeLimitMinutes"
                  name="timeLimitMinutes"
                  type="number"
                  min={0}
                  value={formData.timeLimitMinutes}
                  onChange={(event) => {
                    const value = Number(event.target.value) || 0;
                    onChange("timeLimitMinutes", value);
                    onChange("enableTimeLimit", value > 0);
                  }}
                  className="w-full rounded-xl border-emerald-200 px-3 py-2.5 text-sm text-slate-700 shadow-sm transition-all focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
                <p className="text-xs text-slate-500">Use 0 if the assessment should stay untimed.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startsAt" className="text-sm font-bold text-slate-800">Starts at</Label>
                <Input
                  id="startsAt"
                  name="startsAt"
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(event) => onChange("startsAt", event.target.value)}
                  className="w-full rounded-xl border-emerald-200 pl-3 pr-1 py-2.5 text-sm text-slate-700 shadow-sm transition-all focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endsAt" className="text-sm font-bold text-slate-800">Ends at</Label>
                <Input
                  id="endsAt"
                  name="endsAt"
                  type="datetime-local"
                  value={formData.endsAt}
                  onChange={(event) => onChange("endsAt", event.target.value)}
                  className="w-full rounded-xl border-emerald-200 pl-3 pr-1 py-2.5 text-sm text-slate-700 shadow-sm transition-all focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-sm transition-all hover:shadow-md">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 rounded-t-2xl">
          <CardTitle className="text-lg text-slate-800">Session Strategy</CardTitle>
          <CardDescription>
            Decide how participants enter the assessment and how questions are assembled.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <button
              type="button"
              onClick={() => onChange("sessionMode", "SELF_PACED")}
              className={`flex w-full flex-col items-start rounded-2xl border p-5 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                formData.sessionMode === "SELF_PACED"
                  ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary"
                  : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm"
              }`}
            >
              <TimerReset className={`h-6 w-6 shrink-0 ${formData.sessionMode === "SELF_PACED" ? "text-primary" : "text-slate-500"}`} />
              <h3 className={`mt-4 text-lg font-bold whitespace-normal leading-tight ${formData.sessionMode === "SELF_PACED" ? "text-slate-900" : "text-slate-800"}`}>Self Paced</h3>
              <p className="mt-1 text-sm text-slate-600 whitespace-normal leading-relaxed">
                Participants can enter on their own schedule and complete independently.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onChange("sessionMode", "REAL_TIME")}
              className={`flex w-full flex-col items-start rounded-2xl border p-5 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                formData.sessionMode === "REAL_TIME"
                  ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary"
                  : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm"
              }`}
            >
              <Sparkles className={`h-6 w-6 shrink-0 ${formData.sessionMode === "REAL_TIME" ? "text-primary" : "text-slate-500"}`} />
              <h3 className={`mt-4 text-lg font-bold whitespace-normal leading-tight ${formData.sessionMode === "REAL_TIME" ? "text-slate-900" : "text-slate-800"}`}>Real Time</h3>
              <p className="mt-1 text-sm text-slate-600 whitespace-normal leading-relaxed">
                Host-led delivery with fixed launch windows and shared timing expectations.
              </p>
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <button
              type="button"
              onClick={() => onChange("questionSelection", "MANUAL")}
              className={`flex w-full flex-col items-start rounded-2xl border p-5 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                formData.questionSelection === "MANUAL"
                  ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary"
                  : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm"
              }`}
            >
              <Clock3 className={`h-6 w-6 shrink-0 ${formData.questionSelection === "MANUAL" ? "text-primary" : "text-slate-500"}`} />
              <h3 className={`mt-4 text-lg font-bold whitespace-normal leading-tight ${formData.questionSelection === "MANUAL" ? "text-slate-900" : "text-slate-800"}`}>Manual Selection</h3>
              <p className="mt-1 text-sm text-slate-600 whitespace-normal leading-relaxed">
                Hand-pick the exact questions that will appear in this assessment.
              </p>
            </button>

            <button
              type="button"
              disabled={formData.sessionMode === "REAL_TIME"}
              onClick={() => onChange("questionSelection", "DYNAMIC")}
              className={`flex w-full flex-col items-start rounded-2xl border p-5 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                formData.questionSelection === "DYNAMIC"
                  ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary"
                  : formData.sessionMode === "REAL_TIME"
                  ? "border-slate-100 bg-slate-50/50 opacity-50 cursor-not-allowed"
                  : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm"
              }`}
            >
              <Sparkles className={`h-6 w-6 shrink-0 ${
                formData.questionSelection === "DYNAMIC" 
                  ? "text-primary" 
                  : formData.sessionMode === "REAL_TIME"
                  ? "text-slate-300"
                  : "text-slate-500"
              }`} />
              <h3 className={`mt-4 text-lg font-bold whitespace-normal leading-tight ${
                formData.questionSelection === "DYNAMIC" 
                  ? "text-slate-900" 
                  : formData.sessionMode === "REAL_TIME"
                  ? "text-slate-400"
                  : "text-slate-800"
              }`}>Dynamic Selection</h3>
              <p className={`mt-2 text-sm whitespace-normal leading-relaxed ${
                formData.sessionMode === "REAL_TIME" ? "text-slate-400" : "text-slate-600"
              }`}>
                Randomizes a unique set of questions for each participant at runtime, based on your chosen difficulty distribution.
                {formData.sessionMode === "REAL_TIME" && (
                  <span className="block mt-2 font-medium text-amber-600">
                    Not available because Real Time sessions require all participants to answer the exact same questions synchronously.
                  </span>
                )}
              </p>
            </button>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            <Label className="text-sm font-bold text-slate-800">
              Participant Identity
            </Label>
            <DropdownSelect
            className="z-80"
              value={formData.participantIdentity}
              options={[
                { value: "ANONYMOUS", label: "Anonymous participant" },
                { value: "AUTHENTICATED", label: "Authenticated participant" },
                { value: "EXTERNAL", label: "External participant" },
              ]}
              onChange={(val) =>
                onChange("participantIdentity", val as NewAssessmentFormData["participantIdentity"])
              }
            />
            <p className="text-sm text-slate-500">
              Define who is allowed to take this assessment and whether their identity is tracked.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-sm transition-all hover:shadow-md">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 rounded-t-2xl">
          <CardTitle className="text-lg text-slate-800">Timing and Participant Rules</CardTitle>
          <CardDescription>
            Configure time windows, navigation behavior, and how results are released after submission.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="timeLimitMinutes" className="text-sm font-bold text-slate-800">Time limit (minutes)</Label>
              <Input
                id="timeLimitMinutes"
                name="timeLimitMinutes"
                type="number"
                min={0}
                value={formData.timeLimitMinutes}
                onChange={(event) => {
                  const value = Number(event.target.value) || 0;
                  onChange("timeLimitMinutes", value);
                  onChange("enableTimeLimit", value > 0);
                }}
                className="w-full rounded-xl border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
              />
              <p className="text-xs text-slate-500">Use `0` if the assessment should stay untimed.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startsAt" className="text-sm font-bold text-slate-800">Starts at</Label>
              <Input
                id="startsAt"
                name="startsAt"
                type="datetime-local"
                value={formData.startsAt}
                onChange={(event) => onChange("startsAt", event.target.value)}
                className="w-full rounded-xl border-slate-200 pl-3 pr-1 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endsAt" className="text-sm font-bold text-slate-800">Ends at</Label>
              <Input
                id="endsAt"
                name="endsAt"
                type="datetime-local"
                value={formData.endsAt}
                onChange={(event) => onChange("endsAt", event.target.value)}
                className="w-full rounded-xl border-slate-200 pl-3 pr-1 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Label htmlFor="shuffleQuestions" className="font-bold text-slate-800 cursor-pointer">Shuffle questions</Label>
                  <p className="mt-1 text-sm text-slate-500 whitespace-normal leading-relaxed">
                    Randomize the order participants see to reduce predictable answer flow.
                  </p>
                </div>
                <Input
                  id="shuffleQuestions"
                  name="shuffleQuestions"
                  type="checkbox"
                  checked={formData.shuffleQuestions}
                  onChange={(event) => onChange("shuffleQuestions", event.target.checked)}
                  className="mt-1 h-5 w-5 rounded text-primary focus:ring-primary/50 cursor-pointer"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Label htmlFor="enableAiGrading" className="font-bold text-slate-800 cursor-pointer">Enable AI Auto-Grading</Label>
                  <p className="mt-1 text-sm text-slate-500 whitespace-normal leading-relaxed">
                    Automatically use AI to review and score subjective questions (Essay/Short Answer).
                  </p>
                </div>
                <Input
                  id="enableAiGrading"
                  name="enableAiGrading"
                  type="checkbox"
                  checked={formData.enableAiGrading}
                  onChange={(event) => onChange("enableAiGrading", event.target.checked)}
                  className="mt-1 h-5 w-5 rounded text-primary focus:ring-primary/50 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="passMark" className="text-sm font-bold text-slate-800">Pass mark (%)</Label>
              <Input
                id="passMark"
                name="passMark"
                type="number"
                min={0}
                max={100}
                value={formData.passMark}
                onChange={(event) => onChange("passMark", Number(event.target.value) || 0)}
                className="w-full rounded-xl border-slate-200 px-4 py-3 text-base text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-800">Show results</Label>
              <DropdownSelect
                value={formData.showResults}
                options={[
                  { value: "IMMEDIATELY", label: "Immediately after submit" },
                  { value: "MANUAL", label: "Manual release" },
                  { value: "NEVER", label: "Never show" },
                ]}
                onChange={(val) =>
                  onChange("showResults", val as NewAssessmentFormData["showResults"])
                }
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800">Grade scale</h3>
                <p className="mt-1 text-sm text-slate-500 whitespace-normal leading-relaxed">
                  Set grade labels (like A, B, C or Pass/Fail) and specify the minimum percentage score required to achieve each.
                </p>
              </div>
              <Button
                type="button"
                onClick={onAddGradeLabel}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 shadow-sm bg-white" variant="secondary"
              >
                <Plus className="h-4 w-4" />
                Add label
              </Button>
            </div>

            <div className="space-y-3">
              {formData.gradeLabels.map((label, index) => (
                <div key={`${label.grade}-${index}`} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 grid-cols-1 sm:grid-cols-[160px_minmax(0,1fr)_48px] shadow-sm items-center">
                  <Input
                    id={`grade-label-${index}`}
                    name={`grade-label-${index}`}
                    type="text"
                    value={label.grade}
                    onChange={(event) => onGradeLabelChange(index, "grade", event.target.value)}
                    placeholder="Grade label"
                    aria-label={`Grade label ${index + 1}`}
                    className="rounded-xl border-slate-200 px-4 py-3 text-base text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                  />
                  <Input
                    id={`grade-minPercent-${index}`}
                    name={`grade-minPercent-${index}`}
                    type="number"
                    min={0}
                    max={100}
                    value={label.minPercent}
                    onChange={(event) =>
                      onGradeLabelChange(index, "minPercent", Number(event.target.value) || 0)
                    }
                    placeholder="Minimum percent"
                    aria-label={`Minimum percent for grade ${index + 1}`}
                    className="rounded-xl border-slate-200 px-4 py-3 text-base text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                  />
                  <Button
                    type="button"
                    onClick={() => onRemoveGradeLabel(index)}
                    className="inline-flex h-12 w-full sm:w-12 items-center justify-center rounded-xl border border-red-200 text-red-600 transition hover:bg-red-50 bg-white shadow-sm sm:ml-auto"
                    aria-label={`Remove grade label ${label.grade || index + 1}`} variant="destructive"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
