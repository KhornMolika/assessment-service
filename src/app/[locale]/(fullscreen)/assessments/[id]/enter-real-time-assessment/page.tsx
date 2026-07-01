import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAssessmentCatalogItemById } from "@/src/api/assessment.api";
import { EnterRealTimeScreen } from "@/src/components/assessment/session/SessionScreens";
import { SessionLoading } from "@/src/components/assessment/session/SessionLoading";

async function AssessmentEnterRealTimePageContent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const sessionCode = resolvedSearchParams?.sessionCode as string | undefined;

  const assessment = await getAssessmentCatalogItemById(id);

  if (!assessment) {
    notFound();
  }

  return <EnterRealTimeScreen assessment={assessment} sessionCode={sessionCode} />;
}

export default function AssessmentEnterRealTimePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <Suspense fallback={<SessionLoading />}>
      <AssessmentEnterRealTimePageContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
