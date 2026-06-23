"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, Edit, Eye, Trash2, X } from "lucide-react";
import type { AssessmentCatalogItem } from "@/src/types/assessment-catalog.types";
import type {
  AssessmentDeliveryMode,
  AssessmentLifecycle,
} from "@/src/types/assessment.types";
import { Badge } from "@/src/components/ui/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/ui/table";
import { Button } from "@/src/components/ui/ui/button";

import DeleteConfirmModal from "@/src/components/ui/modals/DeleteConfirmModal";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteAssessmentAction } from "@/src/lib/actions/assessment.actions";

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
  onDuplicateAssessment,
}: {
  assessments: AssessmentCatalogItem[];
  onDuplicateAssessment: (assessment: AssessmentCatalogItem) => void;
}) {
  const [assessmentToDelete, setAssessmentToDelete] =
    useState<AssessmentCatalogItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDeleteConfirm = () => {
    if (!assessmentToDelete) return;
    startTransition(async () => {
      try {
        const res = await deleteAssessmentAction(assessmentToDelete.id);
        if (res.success) {
          toast.success("Assessment deleted successfully");
          setAssessmentToDelete(null);
        } else {
          toast.error(res.error || "Failed to delete assessment");
        }
      } catch (e: any) {
        toast.error(e.message || "An unexpected error occurred");
      }
    });
  };

  return (
    <>
      <Table className="min-w-280">
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
                  <Link
                    href={`/assessments/${assessment.id}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {assessment.title}
                  </Link>
                  <p className="mt-1 text-xs text-inkd">
                    {assessment.question_bank_name} · Starts{" "}
                    {formatStartDate(assessment.starts_at)}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-inkd">
                {formatDeliveryMode(assessment.delivery_mode)}
              </TableCell>
              <TableCell>
                <Badge variant={getLifecycleBadgeVariant(assessment.lifecycle)}>
                  {formatLifecycle(assessment.lifecycle)}
                </Badge>
              </TableCell>
              <TableCell className="text-center font-medium text-primary">
                {assessment.question_count}
              </TableCell>
              <TableCell className="text-center text-inkd">
                {assessment.participant_count}
              </TableCell>
              <TableCell className="text-center font-medium text-primary">
                {assessment.pass_rate}
              </TableCell>
              <TableCell className="text-center font-medium text-primary">
                {assessment.average_score}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/assessments/${assessment.id}`}
                    title="View assessment"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-blue-500 transition hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                  <Link
                    href={`/assessments/${assessment.id}/edit`}
                    title="Edit assessment"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-emerald-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                  <Button
                    type="button"
                    title="Duplicate assessment"
                    size="icon"
                    onClick={() => onDuplicateAssessment(assessment)}
                    className="h-8 w-8 rounded-md text-indigo-500 transition hover:bg-indigo-50 hover:text-indigo-600" variant="ghost"
                  >
                    <Copy className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    title="Delete assessment"
                    size="icon"
                    onClick={() => setAssessmentToDelete(assessment)}
                    className="h-8 w-8 rounded-md text-red-500 transition hover:bg-red-50 hover:text-red-600" variant="ghost"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DeleteConfirmModal
        open={!!assessmentToDelete}
        onClose={() => setAssessmentToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Assessment"
        entityName={assessmentToDelete?.title || ""}
        description="Are you sure you want to delete this assessment? This action removes it from the catalog and cannot be undone."
        isPending={isPending}
      />
    </>
  );
}
