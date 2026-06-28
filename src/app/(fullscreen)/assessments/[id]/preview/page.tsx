import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAssessmentCatalogItemById,
  getAssessmentDetailPageData,
} from "@/src/api/assessment.api";
import { 
  PreviewScreen,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  PresentRealTimeScreen,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  EnterRealTimeScreen,
} from "@/src/components/assessment/session/SessionScreens";
import { RealTimeSimulator } from "@/src/components/assessment/session/RealTimeSimulator";
import { SessionLoading } from "@/src/components/assessment/session/SessionLoading";
import { BackButton } from "@/src/components/ui/navigation/BackButton";

async function AssessmentPreviewPageContent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ run?: string }>;
}) {
  const { id } = await params;
  const { run } = await searchParams;
  const detail = await getAssessmentDetailPageData(id);

  if (!detail) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assessment = detail.assessment as any;

  const mode = assessment.settings?.mode;

  if (mode === "REAL_TIME") {
    const previewInstanceKey = `${assessment.id}-${run ?? "initial"}`;

    return (
      <main className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#d8f3dc,transparent_38%),linear-gradient(180deg,#f7f5f0_0%,#f2ede2_100%)]">
        <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex h-full items-center gap-4">
            <p className="leading-none text-xs font-bold uppercase tracking-widest text-primary">
              Live Session Preview
            </p>
          </div>
          <BackButton
            href={`/assessments/${assessment.id}`}
            label="Exit Preview"
            className="self-center py-2.5"
          />
        </div>
        <RealTimeSimulator 
          key={previewInstanceKey}
          assessment={assessment} 
          questions={detail.questions} 
        />
      </main>
    );
  }

  return (
    <PreviewScreen
      assessment={detail.assessment}
      questions={detail.questions}
      previewMode="SELF_PACED"
      backHref={`/assessments/${assessment.id}`}
    />
  );
}

export default function AssessmentPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ run?: string }>;
}) {
  return (
    <Suspense fallback={<SessionLoading />}>
      <AssessmentPreviewPageContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
