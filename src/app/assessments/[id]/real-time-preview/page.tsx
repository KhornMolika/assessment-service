import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getAssessmentCatalogItemById,
  getAssessmentDetailPageData,
} from "@/src/domains/assessment/api/assessment.api";
import {
  AssessmentHostScreen,
  AssessmentJoinScreen,
} from "@/src/domains/assessment/components/session/AssessmentSessionScreens";

export default async function AssessmentRealTimePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [assessment, detail] = await Promise.all([
    getAssessmentCatalogItemById(id),
    getAssessmentDetailPageData(id),
  ]);

  if (!assessment || !detail) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#d8f3dc,transparent_38%),linear-gradient(180deg,#f7f5f0_0%,#f2ede2_100%)] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-[1800px] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/65">
              Real-time Preview
            </p>
            <h1 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">
              Host and participant views side by side
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-inkd sm:text-base">
              This preview shows the real-time host control room and the participant join flow in a
              single layout. It mirrors the live session UI without saving any session data.
            </p>
          </div>

          <Link
            href={`/assessments/${assessment.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to assessment
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <AssessmentHostScreen
            assessment={assessment}
            questions={detail.questions}
            embedded
          />
          <AssessmentJoinScreen assessment={assessment} embedded />
        </div>
      </div>
    </main>
  );
}
