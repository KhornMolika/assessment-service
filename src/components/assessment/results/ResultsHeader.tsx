import { Download } from "lucide-react";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { ActionMenu } from "@/src/components/ui/ui/action-menu";
import { Button } from "@/src/components/ui/ui/button";

export function ResultsHeader({
  onExportCsv,
  onExportPdf,
}: {
  onExportCsv: () => void;
  onExportPdf: () => void;
}) {
  return (
    <PageHeaderCard
      title="Results"
      description="Cross-assessment answer-sheet records, grading state, and submission outcomes."
      actions={
        <ActionMenu
          trigger={
            <Button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pl"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          }
        >
          <button
            type="button"
            onClick={onExportCsv}
            className="flex w-full items-center px-4 py-2 text-sm font-medium text-inkd hover:bg-muted/50 hover:text-primary transition-colors text-left"
          >
            Export as CSV
          </button>
          <button
            type="button"
            onClick={onExportPdf}
            className="flex w-full items-center px-4 py-2 text-sm font-medium text-inkd hover:bg-muted/50 hover:text-primary transition-colors text-left"
          >
            Export as PDF
          </button>
        </ActionMenu>
      }
    />
  );
}
