import { Badge } from "@/src/components/ui/ui/badge";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/ui/table";
import type { AnalyticsAssessmentRow } from "@/src/types/analytics.types";

function formatMetric(value: number | null) {
  return value === null ? "-" : `${value}%`;
}

export default function AnalyticsAssessmentTable({
  rows,
}: {
  rows: AnalyticsAssessmentRow[];
}) {
  if (rows.length === 0) {
    return (
      <StateMessage
        title="No assessment analytics found"
        description="No assessments match the active topic and assessment filters."
      />
    );
  }

  return (
    <div className="rounded-md border border-neutral-200 overflow-hidden bg-white shadow-sm">
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-[280px]">Assessment</TableHead>
            <TableHead className="w-[180px]">Topics</TableHead>
            <TableHead className="w-[120px] text-right">Participants</TableHead>
            <TableHead className="w-[120px] text-right">Questions</TableHead>
            <TableHead className="w-[140px] text-right">Average score</TableHead>
            <TableHead className="w-[120px] text-right">Pass rate</TableHead>
            <TableHead className="w-[120px] pr-6">Status</TableHead>
          </TableRow>
        </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <div>
                <div className="font-semibold text-primary">{row.title}</div>
                <div className="mt-1 text-xs text-inkd">
                  {row.deliveryMode === "REAL_TIME" ? "Real-time" : "Self-paced"}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-2">
                {(row.topicLabels.length > 0 ? row.topicLabels : ["Unmapped"]).map((topic) => (
                  <Badge key={topic} variant="secondary">
                    {topic}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell className="text-right font-medium text-primary">
              {row.participants.toLocaleString()}
            </TableCell>
            <TableCell className="text-right font-medium text-primary">{row.questions}</TableCell>
            <TableCell className="text-right">{formatMetric(row.averageScore)}</TableCell>
            <TableCell className="text-right">{formatMetric(row.passRate)}</TableCell>
            <TableCell className="pr-6">
              <Badge
                variant={
                  row.lifecycle === "PUBLISHED"
                    ? "success"
                    : row.lifecycle === "DRAFT"
                      ? "warning"
                      : "info"
                }
              >
                {row.lifecycle}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      </Table>
    </div>
  );
}
