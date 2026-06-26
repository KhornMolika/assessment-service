"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, Edit, Eye, Trash2, X, Globe, Archive, Play } from "lucide-react";
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
import ActionConfirmModal from "@/src/components/ui/modals/ActionConfirmModal";
import { useTransition } from "react";
import { toast } from "sonner";
import { ActionMenu } from "@/src/components/ui/ui/action-menu";
import { deleteAssessmentAction, publishAssessmentAction, archiveAssessmentAction } from "@/src/lib/actions/assessment.actions";
import AssessmentShareAction from "../AssessmentShareAction";

function formatDeliveryMode(deliveryMode: AssessmentDeliveryMode) {
  return deliveryMode === "SELF_PACED" ? "Self Paced" : "Real Time";
}

function formatDate(date: string | null | undefined) {
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
  const [assessmentToPublish, setAssessmentToPublish] = useState<AssessmentCatalogItem | null>(null);
  const [assessmentToArchive, setAssessmentToArchive] = useState<AssessmentCatalogItem | null>(null);
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
          setAssessmentToPublish(null);
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
          setAssessmentToArchive(null);
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
            <TableHead>Time Limit</TableHead>
            <TableHead>Identity</TableHead>
            <TableHead>Selection</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Questions</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.map((assessment) => {
            const actualTitle = assessment.name;
            const actualMode = assessment.settings?.mode;
            const actualStatus = assessment.status;
            const actualStartsAt = assessment.settings?.startsAt || assessment.createdAt;
            const actualEndsAt = assessment.settings?.endsAt;
            const actualNumQuestions = assessment.settings?.numQuestions ?? 0;
            const actualType = assessment.type || "QUIZ";
            const actualSelection = assessment.settings?.questionSelection || "MANUAL";
            const actualTimeLimit = assessment.settings?.timeLimit;
            const actualIdentity = assessment.settings?.participantIdentity || "ANONYMOUS";
            
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
                      Starts {formatDate(actualStartsAt as string)}
                      {actualEndsAt ? ` - Ends ${formatDate(actualEndsAt as string)}` : ""}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-inkd capitalize">
                  {actualType.toLowerCase()}
                </TableCell>
                <TableCell className="text-inkd">
                  {formatDeliveryMode(actualMode as AssessmentDeliveryMode)}
                </TableCell>
                <TableCell className="text-inkd">
                  {actualTimeLimit ? `${actualTimeLimit} min` : "-"}
                </TableCell>
                <TableCell className="text-inkd capitalize">
                  {actualIdentity.toLowerCase()}
                </TableCell>
                <TableCell className="text-inkd capitalize">
                  {actualSelection.toLowerCase()}
                </TableCell>
                <TableCell>
                  <Badge variant={getLifecycleBadgeVariant(actualStatus as AssessmentLifecycle)}>
                    {formatLifecycle(actualStatus as AssessmentLifecycle)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center font-medium text-primary">
                  {actualNumQuestions}
                </TableCell>
                <TableCell className="text-right">
                  <ActionMenu>
                    {actualStatus === "DRAFT" && (
                      <button
                        type="button"
                        onClick={() => setAssessmentToPublish(assessment)}
                        disabled={isPending}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-violet-600 transition hover:bg-violet-50 disabled:opacity-50"
                      >
                        <Globe className="h-4 w-4" /> Publish
                      </button>
                    )}
                    {actualStatus === "PUBLISHED" && (
                      <button
                        type="button"
                        onClick={() => setAssessmentToArchive(assessment)}
                        disabled={isPending}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-amber-600 transition hover:bg-amber-50 disabled:opacity-50"
                      >
                        <Archive className="h-4 w-4" /> Archive
                      </button>
                    )}
                    {actualStatus === "PUBLISHED" && (
                      <>
                        <AssessmentShareAction
                          assessment={assessment as any}
                          buttonClassName="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-sky-600 transition hover:bg-sky-50"
                          labelClassName=""
                        />
                        <Link
                          href={`/assessments/${assessment.id}/preview`}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-pink-600 transition hover:bg-pink-50"
                        >
                          <Play className="h-4 w-4" /> Preview
                        </Link>
                      </>
                    )}
                    <Link
                      href={`/assessments/${assessment.id}`}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4" /> View
                    </Link>
                    {actualStatus === "ARCHIVED" ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          toast.error("An archived assessment cannot be edited anymore.", {
                            id: "edit-blocked-toast",
                          });
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-gray-400 transition hover:bg-gray-50 cursor-not-allowed"
                      >
                        <Edit className="h-4 w-4" /> Edit
                      </button>
                    ) : (
                      <Link
                        href={`/assessments/${assessment.id}/edit`}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
                      >
                        <Edit className="h-4 w-4" /> Edit
                      </Link>
                    )}
                    <Link
                      href={`/assessments/${assessment.id}/duplicate`}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
                    >
                      <Copy className="h-4 w-4" /> Duplicate
                    </Link>
                    <button
                      type="button"
                      onClick={() => setAssessmentToDelete(assessment)}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </ActionMenu>
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
        entityName={assessmentToDelete?.name || ""}
        description="Are you sure you want to delete this assessment? This action removes it from the catalog and cannot be undone."
        isPending={isPending}
      />
      
      <ActionConfirmModal
        open={!!assessmentToPublish}
        onClose={() => setAssessmentToPublish(null)}
        onConfirm={() => assessmentToPublish && handlePublish(assessmentToPublish.id)}
        title="Publish Assessment"
        description={<>Are you sure you want to publish <strong>{assessmentToPublish?.name}</strong>? This will make it available to participants.</>}
        confirmText="Publish"
        isPending={isPending}
        variant="default"
      />

      <ActionConfirmModal
        open={!!assessmentToArchive}
        onClose={() => setAssessmentToArchive(null)}
        onConfirm={() => assessmentToArchive && handleArchive(assessmentToArchive.id)}
        title="Archive Assessment"
        description={<>Are you sure you want to archive <strong>{assessmentToArchive?.name}</strong>? It will no longer be active.</>}
        confirmText="Archive"
        isPending={isPending}
        variant="destructive"
      />
    </>
  );
}
