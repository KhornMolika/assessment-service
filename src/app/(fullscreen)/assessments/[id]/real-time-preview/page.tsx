import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  getAssessmentCatalogItemById,
  getAssessmentDetailPageData,
} from "@/src/api/assessment.api";
import {
  AssessmentHostScreen,
  AssessmentJoinScreen,
} from "@/src/components/assessment/session/AssessmentSessionScreens";
import { AssessmentSessionLoading } from "@/src/components/assessment/session/AssessmentSessionLoading";
import { BackButton } from "@/src/components/ui/navigation/BackButton";

async function AssessmentRealTimePreviewPageContent({
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
      <div className="mx-auto max-w-450 space-y-6">
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

          <BackButton
            href={`/assessments/${assessment.id}`}
            label="Back to assessment"
          />
        </div>

        <div className="grid items-start gap-6 2xl:grid-cols-2">
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

export default function AssessmentRealTimePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<AssessmentSessionLoading />}>
      <AssessmentRealTimePreviewPageContent params={params} />
    </Suspense>
  );
}
