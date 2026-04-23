import { Download } from "lucide-react";

export function ResultsHeader({
  onExportCsv,
}: {
  onExportCsv: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-primary">Results</h1>
        <p className="mt-2 text-sm text-inkd">
          Cross-assessment answer-sheet records, grading state, and submission outcomes.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onExportCsv}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pl"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>
    </div>
  );
}
