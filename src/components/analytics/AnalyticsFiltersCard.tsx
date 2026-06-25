"use client";

import { ChevronDown, Filter } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/ui/card";
import type { AssessmentCatalogItem } from "@/src/types/assessment-catalog.types";
import { Label } from "@/src/components/ui/ui/label";
import { Select } from "@/src/components/ui/ui/select";

export default function AnalyticsFiltersCard({
  assessments,
  selectedAssessmentId,
  selectedTopicLabel,
  onAssessmentChange,
}: {
  assessments: AssessmentCatalogItem[];
  selectedAssessmentId: string;
  selectedTopicLabel: string;
  onAssessmentChange: (value: string) => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-accl px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Filter className="h-3.5 w-3.5" />
            Active scope
          </div>
          <p className="text-sm text-inkm">
            Topic filter is controlled from the topbar. Current topic:{" "}
            <span className="font-semibold text-primary">{selectedTopicLabel}</span>
          </p>
        </div>

        <div className="w-full lg:max-w-xs">
          <Label className="mb-2 block text-sm font-medium text-primary">
            Assessment filter
          </Label>
          <div className="relative">
            <Select
              value={selectedAssessmentId}
              onChange={(event) => onAssessmentChange(event.target.value)}
              className="w-full appearance-none rounded-xl border border-border bg-white px-4 py-3 pr-10 text-sm text-primary outline-none transition focus:border-primary"
            >
              <option value="all-assessments">All assessments</option>
              {assessments.map((assessment) => (
                <option key={assessment.id} value={assessment.id}>
                  {assessment.name || "Untitled"}
                </option>
              ))}
            </Select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-inkd" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
