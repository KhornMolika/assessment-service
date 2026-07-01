import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAssessmentCatalogItemById, getAssessmentDetailPageData } from "@/src/api/assessment.api";
import { PresentRealTimeScreen } from "@/src/components/assessment/session/SessionScreens";
import { SessionLoading } from "@/src/components/assessment/session/SessionLoading";

async function AssessmentPresentRealTimePageContent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const sessionCode = resolvedSearchParams?.sessionCode as string | undefined;

  const [assessment, detail] = await Promise.all([
    getAssessmentCatalogItemById(id),
    getAssessmentDetailPageData(id),
  ]);

  if (!assessment || !detail) {
    notFound();
  }

  return <PresentRealTimeScreen assessment={assessment} questions={detail.questions} sessionCode={sessionCode} />;
}

export default function AssessmentPresentRealTimePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <Suspense fallback={<SessionLoading />}>
      <AssessmentPresentRealTimePageContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
