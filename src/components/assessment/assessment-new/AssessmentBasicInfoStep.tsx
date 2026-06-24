import type { NewAssessmentFormData } from "@/src/types/assessment-form.types";
import type { Topic } from "@/src/types/topic.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/ui/card";
import { Label } from "@/src/components/ui/ui/label";
import { Input } from "@/src/components/ui/ui/input";
import { Textarea } from "@/src/components/ui/ui/textarea";
import { DropdownSelect } from "@/src/components/ui/ui/dropdown-select";

export default function AssessmentBasicInfoStep({
  formData,
  topics,
  onChange,
  originalStatus,
}: {
  formData: NewAssessmentFormData;
  topics: Topic[];
  onChange: <K extends keyof NewAssessmentFormData>(
    field: K,
    value: NewAssessmentFormData[K],
  ) => void;
  originalStatus?: string;
}) {
  const statusOptions = [
    { value: "DRAFT", label: "Draft" },
    { value: "PUBLISHED", label: "Published" },
    { value: "ARCHIVED", label: "Archived" },
  ].filter((opt) => {
    if (originalStatus && originalStatus !== "DRAFT" && opt.value === "DRAFT") {
      return false;
    }
    return true;
  });

  return (
    <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-sm transition-all hover:shadow-md">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 rounded-t-2xl">
        <CardTitle className="text-lg text-slate-800">Basic Information</CardTitle>
        <CardDescription>
          Add creator-facing metadata first, then we&apos;ll shape delivery and
          evaluation rules.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-4 xl:col-span-2">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-800">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(event) => onChange("name", event.target.value)}
                placeholder="e.g. Compliance Readiness Check"
                className="w-full rounded-xl border-slate-200 px-4 py-3 text-base text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2 flex-1 flex flex-col">
              <Label className="text-sm font-bold text-slate-800">
                Description
              </Label>
              <Textarea
                value={formData.description}
                onChange={(event) =>
                  onChange("description", event.target.value)
                }
                placeholder="Explain the purpose, audience, or release context for this assessment."
                rows={5}
                className="w-full flex-1 min-h-30 resize-none rounded-xl border-slate-200 px-4 py-3 text-base text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:col-span-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-800">
                Type
              </Label>
              <div className="relative">
                <DropdownSelect
                  value={formData.type}
                  onChange={(val) =>
                    onChange("type", val as NewAssessmentFormData["type"])
                  }
                  options={[
                    { value: "QUIZ", label: "Quiz" },
                    { value: "EXAM", label: "Exam" },
                    { value: "SURVEY", label: "Survey" },
                    { value: "PRACTICE", label: "Practice" },
                  ]}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-800">
                Status
              </Label>
              <div className="relative">
                <DropdownSelect
                  value={formData.status}
                  onChange={(val) =>
                    onChange("status", val as NewAssessmentFormData["status"])
                  }
                  options={statusOptions}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
