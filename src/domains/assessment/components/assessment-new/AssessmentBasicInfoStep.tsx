import type { NewAssessmentFormData } from "@/src/domains/assessment/types/assessment-form.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/ui/card";

export default function AssessmentBasicInfoStep({
  formData,
  activeLanguageTab,
  onLanguageTabChange,
  onChange,
}: {
  formData: NewAssessmentFormData;
  activeLanguageTab: "en" | "kh";
  onLanguageTabChange: (language: "en" | "kh") => void;
  onChange: <K extends keyof NewAssessmentFormData>(
    field: K,
    value: NewAssessmentFormData[K],
  ) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Add creator-facing metadata first, then we’ll shape delivery and evaluation rules.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "en" as const, label: "English" },
            { id: "kh" as const, label: "Khmer" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onLanguageTabChange(tab.id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeLanguageTab === tab.id
                  ? "bg-primary text-white"
                  : "border border-border bg-card text-primary hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-6 xl:col-span-2">
            {activeLanguageTab === "en" ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-primary">Title</label>
                  <input
                    type="text"
                    value={formData.titleEN}
                    onChange={(event) => onChange("titleEN", event.target.value)}
                    placeholder="e.g. Compliance Readiness Check"
                    className="w-full rounded-lg border border-border bg-card px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-primary">Description</label>
                  <textarea
                    value={formData.descriptionEN}
                    onChange={(event) => onChange("descriptionEN", event.target.value)}
                    placeholder="Explain the purpose, audience, or release context for this assessment."
                    rows={5}
                    className="w-full resize-none rounded-lg border border-border bg-card px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pm"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-primary">Title (Khmer)</label>
                  <input
                    type="text"
                    value={formData.titleKH}
                    onChange={(event) => onChange("titleKH", event.target.value)}
                    placeholder="??????????????????"
                    className="w-full rounded-lg border border-border bg-card px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-primary">Description (Khmer)</label>
                  <textarea
                    value={formData.descriptionKH}
                    onChange={(event) => onChange("descriptionKH", event.target.value)}
                    placeholder="????????????????????????????????? ??????????????"
                    rows={5}
                    className="w-full resize-none rounded-lg border border-border bg-card px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pm"
                  />
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Status</label>
            <select
              value={formData.status}
              onChange={(event) => onChange("status", event.target.value as NewAssessmentFormData["status"])}
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pm"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Participant Identity</label>
            <select
              value={formData.participantIdentity}
              onChange={(event) =>
                onChange("participantIdentity", event.target.value as NewAssessmentFormData["participantIdentity"])
              }
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pm"
            >
              <option value="ANONYMOUS">Anonymous participant</option>
              <option value="INTERNAL">Internal participant</option>
              <option value="EXTERNAL">External participant</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
