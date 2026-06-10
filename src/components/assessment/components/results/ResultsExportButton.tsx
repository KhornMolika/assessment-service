"use client";

import { Download } from "lucide-react";
import type { ResultsRow } from "./results.types";
import { exportResultsCsv } from "./results.export";
import { Button } from "@/src/components/ui/ui/button";

export default function ResultsExportButton({
  rows,
}: {
  rows: ResultsRow[];
}) {
  return (
    <Button
      type="button"
      onClick={() => exportResultsCsv(rows)}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pl"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  );
}
