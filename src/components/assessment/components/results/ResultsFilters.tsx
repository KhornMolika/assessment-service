import { ChevronDown, Search } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/ui/card";

export function ResultsFilters({
  assessmentOptions,
  selectedAssessment,
  selectedStatus,
  searchQuery,
  sortBy,
  onAssessmentChange,
  onStatusChange,
  onSearchChange,
  onSortChange,
}: {
  assessmentOptions: string[];
  selectedAssessment: string;
  selectedStatus: string;
  searchQuery: string;
  sortBy: string;
  onAssessmentChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_15rem_15rem]">
          <div className="relative">
            <select
              value={selectedAssessment}
              onChange={(event) => onAssessmentChange(event.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-white px-4 py-2.5 pr-10 text-sm text-primary outline-none transition focus:border-primary"
            >
              {assessmentOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-inkd" />
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-inkd" />
            <input
              type="text"
              placeholder="Search by participant name..."
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-full rounded-lg border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-primary outline-none transition focus:border-primary"
            />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-white px-4 py-2.5 pr-10 text-sm text-primary outline-none transition focus:border-primary"
            >
              <option value="submitted-new">Submitted: Newest First</option>
              <option value="submitted-old">Submitted: Oldest First</option>
              <option value="score-high">Score: High to Low</option>
              <option value="score-low">Score: Low to High</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-inkd" />
          </div>

          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(event) => onStatusChange(event.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-white px-4 py-2.5 pr-10 text-sm text-primary outline-none transition focus:border-primary"
            >
              <option>All Statuses</option>
              <option>Passed</option>
              <option>Failed</option>
              <option>Pending Review</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-inkd" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
