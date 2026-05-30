import { Download } from "lucide-react";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";

export function ResultsHeader({
  onExportCsv,
}: {
  onExportCsv: () => void;
}) {
  return (
    <PageHeaderCard
      title="Results"
      description="Cross-assessment answer-sheet records, grading state, and submission outcomes."
      actions={
        <button
          type="button"
          onClick={onExportCsv}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pl"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      }
    />
  );
}
