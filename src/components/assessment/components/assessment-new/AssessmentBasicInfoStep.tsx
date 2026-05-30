import type { NewAssessmentFormData } from "@/src/types/assessment-form.types";
import type { Topic } from "@/src/types/topic.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/ui/card";

export default function AssessmentBasicInfoStep({
  formData,
  topics,
  onChange,
}: {
  formData: NewAssessmentFormData;
  topics: Topic[];
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
          Add creator-facing metadata first, then we&apos;ll shape delivery and
          evaluation rules.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(event) => onChange("title", event.target.value)}
                placeholder="e.g. Compliance Readiness Check"
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(event) =>
                  onChange("description", event.target.value)
                }
                placeholder="Explain the purpose, audience, or release context for this assessment."
                rows={5}
                className="w-full resize-none rounded-lg border border-border bg-card px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1  gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">
                Owner Topic
              </label>
              <select
                value={formData.ownerTopicId}
                onChange={(event) =>
                  onChange("ownerTopicId", event.target.value)
                }
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pm"
              >
                <option value="">Select a topic owner</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(event) =>
                  onChange(
                    "status",
                    event.target.value as NewAssessmentFormData["status"],
                  )
                }
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pm"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">
                Participant Identity
              </label>
              <select
                value={formData.participantIdentity}
                onChange={(event) =>
                  onChange(
                    "participantIdentity",
                    event.target
                      .value as NewAssessmentFormData["participantIdentity"],
                  )
                }
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pm"
              >
                <option value="ANONYMOUS">Anonymous participant</option>
                <option value="INTERNAL">Internal participant</option>
                <option value="EXTERNAL">External participant</option>
              </select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
