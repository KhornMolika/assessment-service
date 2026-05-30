"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Copy, Edit, Trash2, X } from "lucide-react";
import AssessmentShareAction from "@/src/components/assessment/components/AssessmentShareAction";
import type { AssessmentDetailRecord } from "@/src/types/assessment-detail.types";

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

type PlayerCopyTarget = "self-paced" | "host" | "participant";

const playerSnippets: Record<PlayerCopyTarget, string> = {
  "self-paced": `import { AssessmentTakeScreen } from "@/src/components/assessment/components/session/AssessmentSessionScreens";

<AssessmentTakeScreen
  assessment={assessment}
  questions={questions}
/>`,
  host: `import { AssessmentHostScreen } from "@/src/components/assessment/components/session/AssessmentSessionScreens";

<AssessmentHostScreen
  assessment={assessment}
  questions={questions}
  embedded
/>`,
  participant: `import { AssessmentJoinScreen } from "@/src/components/assessment/components/session/AssessmentSessionScreens";

<AssessmentJoinScreen
  assessment={assessment}
  embedded
/>`,
};

export default function AssessmentDetailActions({
  assessment,
}: {
  assessment: AssessmentDetailRecord;
}) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copiedPlayer, setCopiedPlayer] = useState<PlayerCopyTarget | null>(
    null,
  );

  async function handleCopyPlayer(target: PlayerCopyTarget) {
    await navigator.clipboard.writeText(playerSnippets[target]);
    setCopiedPlayer(target);
    window.setTimeout(() => setCopiedPlayer(null), 1600);
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <AssessmentShareAction
          assessment={assessment}
          buttonClassName="hover:cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
          labelClassName="text-sm font-semibold"
        />

        {assessment.delivery_mode === "SELF_PACED" ? (
          <button
            type="button"
            onClick={() => void handleCopyPlayer("self-paced")}
            className="hover:cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
          >
            <Copy className="h-4 w-4" />
            {copiedPlayer === "self-paced" ? "Copied" : "Self-Paced Player"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void handleCopyPlayer("host")}
              className="hover:cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
            >
              <Copy className="h-4 w-4" />
              {copiedPlayer === "host" ? "Copied" : "Host Player"}
            </button>
            <button
              type="button"
              onClick={() => void handleCopyPlayer("participant")}
              className="hover:cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
            >
              <Copy className="h-4 w-4" />
              {copiedPlayer === "participant" ? "Copied" : "Participant Player"}
            </button>
          </>
        )}
        <Link
          href={`/assessments/${assessment.id}/edit`}
          className="hover:cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
        >
          <Edit className="h-4 w-4" />
          Edit
        </Link>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="hover:cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
        <Link
          href={`/assessments/${assessment.id}/reports`}
          className="hover:cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
        >
          <BarChart3 className="h-4 w-4" />
          View report
        </Link>
      </div>

      {showDeleteModal ? (
        <ModalShell onClose={() => setShowDeleteModal(false)}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-500">
                Delete Assessment
              </p>
              <h3 className="mt-2 text-2xl font-bold text-primary">
                {assessment.title}
              </h3>
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
            Are you sure you want to delete this assessment? This will also
            affect related sessions, reports, and participant access. This
            action cannot be undone.
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
