import { Badge } from "@/src/shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import type { AnalyticsAssessmentRow } from "../types/analytics.types";

function formatMetric(value: number | null) {
  return value === null ? "-" : `${value}%`;
}

export default function AnalyticsAssessmentTable({
  rows,
}: {
  rows: AnalyticsAssessmentRow[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessment analytics breakdown</CardTitle>
        <CardDescription>
          Assessment-level view of participation, question load, and published outcomes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/40 p-6 text-sm text-inkd">
            No assessments match the active topic and assessment filters.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assessment</TableHead>
                <TableHead>Topics</TableHead>
                <TableHead className="text-right">Participants</TableHead>
                <TableHead className="text-right">Questions</TableHead>
                <TableHead className="text-right">Average score</TableHead>
                <TableHead className="text-right">Pass rate</TableHead>
                <TableHead>Status</TableHead>
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
                  <TableCell className="text-right font-medium text-primary">
                    {row.questions}
                  </TableCell>
                  <TableCell className="text-right">{formatMetric(row.averageScore)}</TableCell>
                  <TableCell className="text-right">{formatMetric(row.passRate)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.lifecycle === "ACTIVE"
                          ? "success"
                          : row.lifecycle === "DRAFT" || row.lifecycle === "PENDING"
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
        )}
      </CardContent>
    </Card>
  );
}
