"use client";

import { Download } from "lucide-react";
import type { ResultsRow } from "./results.types";
import { exportResultsCsv } from "./results.export";
import { ActionMenu } from "@/src/components/ui/ui/action-menu";
import { Button } from "@/src/components/ui/ui/button";
import { exportResultsPdf } from "./results.export.pdf";

export default function ResultsExportButton({
  rows,
}: {
  rows: ResultsRow[];
}) {
  return (
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
        onClick={() => exportResultsCsv(rows)}
        className="flex w-full items-center px-4 py-2 text-sm font-medium text-inkd hover:bg-muted/50 hover:text-primary transition-colors text-left"
      >
        Export as CSV
      </button>
      <button
        type="button"
        onClick={() => exportResultsPdf(rows)}
        className="flex w-full items-center px-4 py-2 text-sm font-medium text-inkd hover:bg-muted/50 hover:text-primary transition-colors text-left"
      >
        Export as PDF
      </button>
    </ActionMenu>
  );
}
