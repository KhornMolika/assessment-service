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
import { deleteAssessmentAction, publishAssessmentAction, archiveAssessmentAction } from "@/src/lib/actions/assessment.actions";

function formatDeliveryMode(deliveryMode: AssessmentDeliveryMode) {
  return deliveryMode === "SELF_PACED" ? "Self Paced" : "Real Time";
}

function formatStartDate(date: string) {
  if (!date) return "-";
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return "-";
  
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function getLifecycleBadgeVariant(lifecycle: AssessmentLifecycle) {
  switch (lifecycle) {
    case "PUBLISHED":
      return "success" as const;
    case "DRAFT":
      return "info" as const;
    case "ARCHIVED":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

function formatLifecycle(lifecycle?: AssessmentLifecycle) {
  if (!lifecycle) return "Unknown";
  return lifecycle.charAt(0) + lifecycle.slice(1).toLowerCase();
}



export default function AssessmentsTable({
  assessments,
}: {
  assessments: AssessmentCatalogItem[];
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

  const handlePublish = (id: string) => {
    startTransition(async () => {
      try {
        const res = await publishAssessmentAction(id);
        if (res.success) {
          toast.success("Assessment published successfully");
        } else {
          toast.error(res.error || "Failed to publish assessment");
        }
      } catch (e: any) {
        toast.error(e.message || "An unexpected error occurred");
      }
    });
  };

  const handleArchive = (id: string) => {
    startTransition(async () => {
      try {
        const res = await archiveAssessmentAction(id);
        if (res.success) {
          toast.success("Assessment archived successfully");
        } else {
          toast.error(res.error || "Failed to archive assessment");
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
            <TableHead>Type</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Selection</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Questions</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.map((assessment) => {
            const actualTitle = assessment.name || assessment.title;
            const actualMode = assessment.settings?.mode || assessment.delivery_mode;
            const actualStatus = assessment.status || assessment.lifecycle;
            const actualStartsAt = assessment.settings?.startsAt || assessment.starts_at;
            const actualNumQuestions = assessment.settings?.numQuestions ?? assessment.question_count ?? 0;
            const actualType = assessment.type || "QUIZ";
            const actualSelection = assessment.settings?.questionSelection || "MANUAL";
            
            return (
              <TableRow key={assessment.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="max-w-md">
                    <Link
                      href={`/assessments/${assessment.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {actualTitle}
                    </Link>
                    <p className="mt-1 text-xs text-inkd">
                      Starts {formatStartDate(actualStartsAt as string)}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-inkd capitalize">
                  {actualType.toLowerCase()}
                </TableCell>
                <TableCell className="text-inkd">
                  {formatDeliveryMode(actualMode as AssessmentDeliveryMode)}
                </TableCell>
                <TableCell className="text-inkd capitalize">
                  {actualSelection.toLowerCase()}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <Badge variant={getLifecycleBadgeVariant(actualStatus as AssessmentLifecycle)}>
                      {formatLifecycle(actualStatus as AssessmentLifecycle)}
                    </Badge>
                    {actualStatus === "DRAFT" && (
                      <button 
                        onClick={() => handlePublish(assessment.id)}
                        disabled={isPending}
                        className="text-[10px] uppercase font-semibold tracking-wider text-indigo-600 hover:text-indigo-800 hover:underline disabled:opacity-50 transition-colors"
                      >
                        Publish
                      </button>
                    )}
                    {actualStatus === "PUBLISHED" && (
                      <button 
                        onClick={() => handleArchive(assessment.id)}
                        disabled={isPending}
                        className="text-[10px] uppercase font-semibold tracking-wider text-amber-600 hover:text-amber-800 hover:underline disabled:opacity-50 transition-colors"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center font-medium text-primary">
                  {actualNumQuestions}
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
                    <Link
                      href={`/assessments/${assessment.id}/duplicate`}
                      title="Duplicate assessment"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-indigo-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <Copy className="h-5 w-5" />
                    </Link>
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
            );
          })}
        </TableBody>
      </Table>

      <DeleteConfirmModal
        open={!!assessmentToDelete}
        onClose={() => setAssessmentToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Assessment"
        entityName={assessmentToDelete?.name || assessmentToDelete?.title || ""}
        description="Are you sure you want to delete this assessment? This action removes it from the catalog and cannot be undone."
        isPending={isPending}
      />
    </>
  );
}
