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

function ModalShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function DeleteAssessmentModal({
  assessment,
  onClose,
  onConfirm,
}: {
  assessment: AssessmentCatalogItem | null;
  onClose: () => void;
  onConfirm: (assessmentId: string) => void;
}) {
  if (!assessment) {
    return null;
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-500">
            Delete Assessment
          </p>
          <h3 className="mt-2 text-2xl font-bold text-primary">
            {assessment.title}
          </h3>
        </div>
        <Button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-inkd transition hover:bg-muted"
          aria-label="Close delete modal" variant="secondary"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <p className="mt-5 text-sm leading-6 text-inkd">
        Are you sure you want to delete this assessment? This action removes{" "}
        <span className="font-semibold text-primary">{assessment.title}</span>{" "}
        from the catalog view and cannot be undone.
      </p>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-muted" variant="secondary"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => onConfirm(assessment.id)}
          className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600" variant="destructive"
        >
          Delete assessment
        </Button>
      </div>
    </ModalShell>
  );
}

export default function AssessmentsTable({
  assessments,
  onDuplicateAssessment,
  onDeleteAssessment,
}: {
  assessments: AssessmentCatalogItem[];
  onDuplicateAssessment: (assessment: AssessmentCatalogItem) => void;
  onDeleteAssessment: (assessmentId: string) => void;
}) {
  const [assessmentToDelete, setAssessmentToDelete] =
    useState<AssessmentCatalogItem | null>(null);

  const handleDeleteConfirm = (assessmentId: string) => {
    onDeleteAssessment(assessmentId);
    setAssessmentToDelete(null);
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
                    className="inline-flex items-center gap-1 rounded-md p-2 text-inkd transition hover:bg-muted"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/assessments/${assessment.id}/edit`}
                    title="Edit assessment"
                    className="inline-flex items-center gap-1 rounded-md p-2 text-inkd transition hover:bg-muted"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <Button
                    type="button"
                    title="Duplicate assessment"
                    onClick={() => onDuplicateAssessment(assessment)}
                    className="inline-flex items-center gap-1 rounded-md p-2 text-inkd transition hover:bg-muted" variant="secondary"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    title="Delete assessment"
                    onClick={() => setAssessmentToDelete(assessment)}
                    className="inline-flex items-center gap-1 rounded-md p-2 text-red-500 transition hover:bg-red-50" variant="destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DeleteAssessmentModal
        assessment={assessmentToDelete}
        onClose={() => setAssessmentToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
