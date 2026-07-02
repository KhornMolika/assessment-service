import { Badge } from "@/src/components/ui/ui/badge";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/ui/table";
import type { ResultsRow } from "./results.types";
import { getGradeTone, getOutcomeBadge } from "./results.utils";

import { useRouter } from "next/navigation";

export function ResultsTable({
  rows,
  detailBackHref,
}: {
  rows: ResultsRow[];
  detailBackHref?: string;
}) {
  const router = useRouter();

  if (rows.length === 0) {
    return (
      <StateMessage
        title="No results found"
        description="No submissions match the current assessment, status, topic, or search filters."
      />
    );
  }

  return (
    <Table>
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead>Participant</TableHead>
          <TableHead>Assessment</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Grade</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Submitted</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((result) => (
          <TableRow 
            key={result.sheetId} 
            className="hover:bg-muted/30 cursor-pointer"
            onClick={() => {
              const href = detailBackHref
                ? `/results/${result.sheetId}?backHref=${encodeURIComponent(detailBackHref)}`
                : `/results/${result.sheetId}`;
              router.push(href);
            }}
          >
            <TableCell>
              <div className="font-semibold text-primary">{result.participantDisplayName}</div>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium text-primary">{result.assessmentTitle}</div>
                <div className="text-sm text-inkd">{result.sessionInfo}</div>
              </div>
            </TableCell>
            <TableCell>
              {result.answerSheetStatus === "IN_PROGRESS" ? (
                <span className="text-sm font-semibold text-inkd">-</span>
              ) : result.percentage == null ? (
                <div className="space-y-1">
                  <div className="h-2 w-32 rounded-full bg-border" />
                  <div className="text-xs text-inkd">Pending review</div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-border">
                      <div
                        className={`h-full ${
                          result.percentage >= 70
                            ? "bg-green-500"
                            : result.percentage >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${result.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-primary">{result.totalScore}</span>
                  </div>
                  <div className="text-xs text-inkd">{result.percentage}%</div>
                </div>
              )}
            </TableCell>
            <TableCell>
              {result.answerSheetStatus === "IN_PROGRESS" ? (
                <span className="inline-flex min-w-12 items-center justify-center rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                  -
                </span>
              ) : (
                <span
                  className={`inline-flex min-w-12 items-center justify-center rounded-lg px-3 py-2 text-sm font-bold ${getGradeTone(result.grade)}`}
                >
                  {result.grade ?? "..."}
                </span>
              )}
            </TableCell>
            <TableCell>
              <div className="space-y-2">
                {result.answerSheetStatus === "IN_PROGRESS" ? (
                  <Badge variant="secondary" className="text-slate-500">
                    In Progress
                  </Badge>
                ) : (
                  getOutcomeBadge(result.outcomeStatus)
                )}
                {result.evaluationStatus === "PENDING_REVIEW" ? (
                  <div>
                    <Badge variant="pending">Needs manual review</Badge>
                  </div>
                ) : null}
              </div>
            </TableCell>
            <TableCell>
              <span className="text-sm text-inkd">{result.timeSpent}</span>
            </TableCell>
            <TableCell>
              <span className="text-sm text-inkd">{result.submittedAt}</span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
