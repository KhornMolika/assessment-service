import Link from "next/link";
import type {
  DashboardAssessmentStatus,
  RecentAssessment,
} from "@/src/types/dashboard.types";
import { Badge } from "@/src/components/ui/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/ui/card";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";

function getStatusVariant(status: DashboardAssessmentStatus) {
  switch (status) {
    case "Published":
      return "success" as const;
    case "Active":
      return "info" as const;
    case "Completed":
      return "secondary" as const;
    case "Scheduled":
      return "pending" as const;
    case "Pending":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

export default function RecentAssessmentTable({
  items,
}: {
  items: RecentAssessment[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle>Recent assessments</CardTitle>
          <CardDescription>
            The latest creator-facing assessments and their current lifecycle.
          </CardDescription>
        </div>
        <Link href="/assessments" className="text-sm font-medium text-primary hover:underline">
          Open all assessments
        </Link>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <StateMessage
            title="No recent assessments"
            description="Recent assessment activity will appear here once assessments are created or updated."
          />
        ) : (
          <div className="rounded-md border border-neutral-200 overflow-hidden bg-white shadow-sm">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[280px]">Assessment</TableHead>
                  <TableHead className="w-[120px]">Delivery</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[100px] text-center">Questions</TableHead>
                  <TableHead className="w-[120px] text-center">Participants</TableHead>
                  <TableHead className="w-[120px] text-center">Pass Rate</TableHead>
                  <TableHead className="w-[160px] text-right pr-6">Last Modified</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {items.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell>
                    <div className="in-w-55">
                      <div className="font-semibold text-primary">
                        <Link href={`/assessments/${assessment.id}`}>{assessment.title}</Link>
                      </div>
                      <div className="text-xs text-inkd">{assessment.bank}</div>
                    </div>
                  </TableCell>
                  <TableCell>{assessment.mode}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(assessment.status)}>{assessment.status}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{assessment.questions}</TableCell>
                  <TableCell className="text-center">{assessment.participants}</TableCell>
                  <TableCell className="text-center">{assessment.passRate}</TableCell>
                  <TableCell className="text-right text-inkd pr-6">{assessment.lastModified}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
