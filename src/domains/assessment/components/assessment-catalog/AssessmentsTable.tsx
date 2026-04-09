import Link from "next/link";
import { Edit, Eye } from "lucide-react";
import type {
  AssessmentCatalogItem,
} from "@/src/domains/assessment/types/assessment-catalog.types";
import type {
  AssessmentDeliveryMode,
  AssessmentLifecycle,
} from "@/src/domains/assessment/types/assessment.types";
import { Badge } from "@/src/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

function formatDeliveryMode(deliveryMode: AssessmentDeliveryMode) {
  return deliveryMode === "SELF_PACED" ? "Self-paced" : "Real-time";
}

function formatStartDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function getLifecycleBadgeVariant(lifecycle: AssessmentLifecycle) {
  switch (lifecycle) {
    case "ACTIVE":
      return "success" as const;
    case "EXAM":
      return "info" as const;
    case "PENDING":
      return "warning" as const;
    case "COMPLETED":
      return "secondary" as const;
    default:
      return "default" as const;
  }
}

function formatLifecycle(lifecycle: AssessmentLifecycle) {
  return lifecycle.charAt(0) + lifecycle.slice(1).toLowerCase();
}

export default function AssessmentsTable({
  assessments,
}: {
  assessments: AssessmentCatalogItem[];
}) {
  return (
    <Table className="min-w-[980px]">
      <TableHeader>
        <TableRow className="bg-muted/40">
          <TableHead>Assessment</TableHead>
          <TableHead>Delivery</TableHead>
          <TableHead>Lifecycle</TableHead>
          <TableHead className="text-center">Questions</TableHead>
          <TableHead className="text-center">Participants</TableHead>
          <TableHead className="text-center">Pass rate</TableHead>
          <TableHead className="text-center">Average</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assessments.map((assessment) => (
          <TableRow key={assessment.id} className="hover:bg-muted/30">
            <TableCell>
              <div className="max-w-md">
                <Link href={`/assessments/${assessment.id}`} className="font-semibold text-primary hover:underline">
                  {assessment.title}
                </Link>
                <p className="mt-1 text-xs text-inkd">
                  {assessment.question_bank_name} · Starts {formatStartDate(assessment.starts_at)}
                </p>
              </div>
            </TableCell>
            <TableCell className="text-inkd">{formatDeliveryMode(assessment.delivery_mode)}</TableCell>
            <TableCell>
              <Badge variant={getLifecycleBadgeVariant(assessment.lifecycle)}>
                {formatLifecycle(assessment.lifecycle)}
              </Badge>
            </TableCell>
            <TableCell className="text-center font-medium text-primary">
              {assessment.question_count}
            </TableCell>
            <TableCell className="text-center text-inkd">{assessment.participant_count}</TableCell>
            <TableCell className="text-center font-medium text-primary">{assessment.pass_rate}</TableCell>
            <TableCell className="text-center font-medium text-primary">{assessment.average_score}</TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Link
                  href={`/assessments/${assessment.id}`}
                  className="inline-flex items-center gap-1 rounded-md p-2 text-inkd transition hover:bg-muted"
                >
                  <Eye className="h-4 w-4" />
                  <span className="text-xs">View</span>
                </Link>
                <Link
                  href={`/assessments/${assessment.id}/edit`}
                  className="inline-flex items-center gap-1 rounded-md p-2 text-inkd transition hover:bg-muted"
                >
                  <Edit className="h-4 w-4" />
                  <span className="text-xs">Edit</span>
                </Link>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
