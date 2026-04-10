"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Edit, PlayCircle, QrCode, Share2, Trash2, X } from "lucide-react";
import type { AssessmentDetailRecord } from "@/src/domains/assessment/types/assessment-detail.types";

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

function ShareQr({
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
      className="h-48 w-48 rounded-2xl bg-white p-3 shadow-inner ring-1 ring-black/5"
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
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

export default function AssessmentDetailActions({
  assessment,
}: {
  assessment: AssessmentDetailRecord;
}) {
  const router = useRouter();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const joinPath = `/join/${assessment.id}`;
  const previewPath = `/assessments/${assessment.id}`;
  const shareUrl =
    typeof window === "undefined" ? joinPath : `${window.location.origin}${joinPath}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setShowShareModal(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
        <Link
          href={`/assessments/${assessment.id}/edit`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
        >
          <Edit className="h-4 w-4" />
          Edit
        </Link>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      {showShareModal ? (
        <ModalShell onClose={() => setShowShareModal(false)}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                Share Assessment
              </p>
              <h3 className="mt-2 text-2xl font-bold text-primary">{assessment.title}</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowShareModal(false)}
              className="rounded-full p-2 text-inkd transition hover:bg-muted"
              aria-label="Close share modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {assessment.delivery_mode === "SELF_PACED" ? (
            <div className="mt-6 space-y-6">
              <div className="rounded-3xl border border-border bg-muted/40 p-5">
                <div className="flex flex-col items-center gap-5 text-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-inkd ring-1 ring-border">
                    <QrCode className="h-4 w-4 text-primary" />
                    Self-paced access
                  </div>
                  <ShareQr assessmentId={assessment.id} title={assessment.title} />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-primary">{assessment.title}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-inkd">Join link</p>
                    <div className="rounded-xl bg-white px-3 py-2 text-sm text-primary shadow-sm ring-1 ring-border">
                      {shareUrl}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-muted"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy link"}
                </button>
                <Link
                  href={joinPath}
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5"
                >
                  Preview
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <p className="text-sm leading-6 text-inkd">
                This assessment runs in real time. Choose whether you want to launch the live
                session now or preview the assessment first.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
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
                  <PlayCircle className="h-4 w-4" />
                  Launch
                </Link>
              </div>
            </div>
          )}
        </ModalShell>
      ) : null}

      {showDeleteModal ? (
        <ModalShell onClose={() => setShowDeleteModal(false)}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-500">
                Delete Assessment
              </p>
              <h3 className="mt-2 text-2xl font-bold text-primary">{assessment.title}</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="rounded-full p-2 text-inkd transition hover:bg-muted"
              aria-label="Close delete modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-6 text-sm leading-6 text-inkd">
            Are you sure you want to delete this assessment? This will also affect related
            sessions, reports, and participant access. This action cannot be undone.
          </p>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                router.push("/assessments");
              }}
              className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </ModalShell>
      ) : null}
    </>
  );
}
