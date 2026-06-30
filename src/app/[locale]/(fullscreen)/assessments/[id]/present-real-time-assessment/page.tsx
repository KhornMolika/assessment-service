import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAssessmentCatalogItemById, getAssessmentDetailPageData } from "@/src/api/assessment.api";
import { PresentRealTimeScreen } from "@/src/components/assessment/session/SessionScreens";
import { SessionLoading } from "@/src/components/assessment/session/SessionLoading";

async function AssessmentPresentRealTimePageContent({
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

  return <PresentRealTimeScreen assessment={assessment} questions={detail.questions} />;
}

export default function AssessmentPresentRealTimePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<SessionLoading />}>
      <AssessmentPresentRealTimePageContent params={params} />
    </Suspense>
  );
}
