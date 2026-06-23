"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Copy, Edit, Trash2, X } from "lucide-react";
import AssessmentShareAction from "@/src/components/assessment/AssessmentShareAction";
import type { AssessmentDetailRecord } from "@/src/types/assessment-detail.types";
import { Button } from "@/src/components/ui/ui/button";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteAssessmentAction } from "@/src/lib/actions/assessment.actions";
import DeleteConfirmModal from "@/src/components/ui/modals/DeleteConfirmModal";

type PlayerCopyTarget = "self-paced" | "host" | "participant";

const playerSnippets: Record<PlayerCopyTarget, string> = {
  "self-paced": `import { AssessmentTakeScreen } from "@/src/components/assessment/session/AssessmentSessionScreens";

<AssessmentTakeScreen
  assessment={assessment}
  questions={questions}
/>`,
  host: `import { AssessmentHostScreen } from "@/src/components/assessment/session/AssessmentSessionScreens";

<AssessmentHostScreen
  assessment={assessment}
  questions={questions}
  embedded
/>`,
  participant: `import { AssessmentJoinScreen } from "@/src/components/assessment/session/AssessmentSessionScreens";

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
  const [isPending, startTransition] = useTransition();

  async function handleCopyPlayer(target: PlayerCopyTarget) {
    await navigator.clipboard.writeText(playerSnippets[target]);
    setCopiedPlayer(target);
    window.setTimeout(() => setCopiedPlayer(null), 1600);
  }

  const handleConfirmDelete = () => {
    startTransition(async () => {
      try {
        const res = await deleteAssessmentAction(assessment.id);
        if (res.success) {
          toast.success("Assessment deleted successfully");
          setShowDeleteModal(false);
          router.push("/assessments");
        } else {
          toast.error(res.error || "Failed to delete assessment");
        }
      } catch (error: any) {
        toast.error(error.message || "An unexpected error occurred");
      }
    });
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <AssessmentShareAction
          assessment={assessment}
          buttonClassName="hover:cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
          labelClassName="text-sm font-semibold"
        />

        {assessment.delivery_mode === "SELF_PACED" ? (
          <Button
            type="button"
            onClick={() => void handleCopyPlayer("self-paced")}
            className="hover:cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-primary transition hover:bg-muted" variant="secondary"
          >
            <Copy className="h-5 w-5" />
            {copiedPlayer === "self-paced" ? "Copied" : "Self-Paced Player"}
          </Button>
        ) : (
          <>
            <Button
              type="button"
              onClick={() => void handleCopyPlayer("host")}
              className="hover:cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-primary transition hover:bg-muted" variant="secondary"
            >
              <Copy className="h-5 w-5" />
              {copiedPlayer === "host" ? "Copied" : "Host Player"}
            </Button>
            <Button
              type="button"
              onClick={() => void handleCopyPlayer("participant")}
              className="hover:cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-primary transition hover:bg-muted" variant="secondary"
            >
              <Copy className="h-5 w-5" />
              {copiedPlayer === "participant" ? "Copied" : "Participant Player"}
            </Button>
          </>
        )}
        <Link
          href={`/assessments/${assessment.id}/edit`}
          className="hover:cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
        >
          <Edit className="h-5 w-5" />
          Edit
        </Link>
        <Button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="hover:cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50" variant="outline"
        >
          <Trash2 className="h-5 w-5" />
          Delete
        </Button>
        <Link
          href={`/assessments/${assessment.id}/reports`}
          className="hover:cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
        >
          <BarChart3 className="h-5 w-5" />
          View report
        </Link>
      </div>

      <DeleteConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Assessment"
        entityName={assessment.title}
        description="Are you sure you want to delete this assessment? This will also affect related sessions, reports, and participant access. This action cannot be undone."
        isPending={isPending}
      />
    </>
  );
}
