"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Edit, Eye, Play, Share2, Trash2, X } from "lucide-react";
import type { AssessmentCatalogItem } from "@/src/domains/assessment/types/assessment-catalog.types";
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

function getAssessmentJoinPath(assessmentId: string) {
  return `/join/${assessmentId}`;
}

function buildQrPattern(value: string) {
  const size = 29;
  const matrix = Array.from({ length: size }, () => Array.from({ length: size }, () => false));
  let seed = Array.from(value).reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) >>> 0;
  }, 2166136261);

  const drawFinder = (startRow: number, startColumn: number) => {
    for (let row = 0; row < 7; row += 1) {
      for (let column = 0; column < 7; column += 1) {
        const isOuterRing = row === 0 || row === 6 || column === 0 || column === 6;
        const isInnerSquare = row >= 2 && row <= 4 && column >= 2 && column <= 4;
        matrix[startRow + row][startColumn + column] = isOuterRing || isInnerSquare;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  for (let index = 8; index < size - 8; index += 1) {
    matrix[6][index] = index % 2 === 0;
    matrix[index][6] = index % 2 === 0;
  }

  const isReserved = (row: number, column: number) => {
    const topLeft = row <= 7 && column <= 7;
    const topRight = row <= 7 && column >= size - 8;
    const bottomLeft = row >= size - 8 && column <= 7;
    const timing = row === 6 || column === 6;

    return topLeft || topRight || bottomLeft || timing;
  };

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      if (isReserved(row, column)) {
        continue;
      }

      seed = (seed * 1664525 + 1013904223) >>> 0;
      matrix[row][column] = ((seed >> 30) & 1) === 1;
    }
  }

  return matrix;
}

function AssessmentShareQr({
  assessmentId,
  title,
}: {
  assessmentId: string;
  title: string;
}) {
  const cells = useMemo(() => buildQrPattern(`${assessmentId}:${title}`), [assessmentId, title]);
  const cellSize = 6;
  const viewBoxSize = cells.length * cellSize;

  return (
    <svg
      aria-label={`QR code for ${title}`}
      className="h-44 w-44 rounded-2xl bg-white p-3 shadow-inner ring-1 ring-black/5"
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      role="img"
    >
      <rect width={viewBoxSize} height={viewBoxSize} fill="#ffffff" />
      {cells.flatMap((row, rowIndex) =>
        row.map((isFilled, columnIndex) =>
          isFilled ? (
            <rect
              key={`${rowIndex}-${columnIndex}`}
              x={columnIndex * cellSize}
              y={rowIndex * cellSize}
              width={cellSize}
              height={cellSize}
              rx="1"
              fill="#1B4332"
            />
          ) : null,
        ),
      )}
    </svg>
  );
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
          <h3 className="mt-2 text-2xl font-bold text-primary">{assessment.title}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-inkd transition hover:bg-muted"
          aria-label="Close delete modal"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-5 text-sm leading-6 text-inkd">
        Are you sure you want to delete this assessment? This action removes{" "}
        <span className="font-semibold text-primary">{assessment.title}</span> from the catalog
        view and cannot be undone.
      </p>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onConfirm(assessment.id)}
          className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          Delete assessment
        </button>
      </div>
    </ModalShell>
  );
}

function ShareAssessmentModal({
  assessment,
  onClose,
}: {
  assessment: AssessmentCatalogItem | null;
  onClose: () => void;
}) {
  if (!assessment) {
    return null;
  }

  const joinPath = getAssessmentJoinPath(assessment.id);
  const previewPath = `/assessments/${assessment.id}`;

  if (assessment.delivery_mode === "REAL_TIME") {
    return (
      <ModalShell onClose={onClose}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
              Share Real-Time Assessment
            </p>
            <h3 className="mt-2 text-2xl font-bold text-primary">{assessment.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-inkd transition hover:bg-muted"
            aria-label="Close share modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-5 text-sm leading-6 text-inkd">
          This assessment runs in real time. Would you like to launch the live session now or
          preview the assessment details first?
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-muted"
          >
            Cancel
          </button>
          <Link
            href={previewPath}
            className="inline-flex items-center justify-center rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
          >
            Preview
          </Link>
          <Link
            href={`${previewPath}?action=launch`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Play className="h-4 w-4" />
            Launch
          </Link>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
            Share Self-Paced Assessment
          </p>
          <h3 className="mt-2 text-2xl font-bold text-primary">{assessment.title}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-inkd transition hover:bg-muted"
          aria-label="Close share modal"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 rounded-[24px] border border-border bg-muted/40 p-5">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
          <AssessmentShareQr assessmentId={assessment.id} title={assessment.title} />
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-inkd">
                Assessment Name
              </p>
              <p className="mt-1 text-lg font-semibold text-primary">{assessment.title}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-inkd">
                Join Link
              </p>
              <div className="mt-1 break-all rounded-xl bg-white px-3 py-2 text-sm text-primary shadow-sm ring-1 ring-border">
                {joinPath}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Link
          href={previewPath}
          className="inline-flex items-center justify-center rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
        >
          Preview
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Done
        </button>
      </div>
    </ModalShell>
  );
}

export default function AssessmentsTable({
  assessments,
  onDeleteAssessment,
}: {
  assessments: AssessmentCatalogItem[];
  onDeleteAssessment: (assessmentId: string) => void;
}) {
  const [assessmentToDelete, setAssessmentToDelete] = useState<AssessmentCatalogItem | null>(null);
  const [assessmentToShare, setAssessmentToShare] = useState<AssessmentCatalogItem | null>(null);

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
                  <button
                    type="button"
                    onClick={() => setAssessmentToShare(assessment)}
                    className="inline-flex items-center gap-1 rounded-md p-2 text-inkd transition hover:bg-muted"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="text-xs">Share</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssessmentToDelete(assessment)}
                    className="inline-flex items-center gap-1 rounded-md p-2 text-red-500 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-xs">Delete</span>
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ShareAssessmentModal
        assessment={assessmentToShare}
        onClose={() => setAssessmentToShare(null)}
      />
      <DeleteAssessmentModal
        assessment={assessmentToDelete}
        onClose={() => setAssessmentToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
