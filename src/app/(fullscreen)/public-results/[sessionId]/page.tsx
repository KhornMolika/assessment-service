import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAssessmentResultSheetPageData } from "@/src/api/assessment.api";
import { PublicResultClient } from "@/src/components/assessment/session/PublicResultClient";
import { ResultsPageSkeleton } from "@/src/components/ui/layout/PageSkeletons";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Assessment Result",
    description: "View the assessment result.",
  };
}

async function PublicResultContent({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const data = await getAssessmentResultSheetPageData(sessionId);

  if (!data) {
    notFound();
  }

  return <PublicResultClient data={data} />;
}

export default function PublicResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  return (
    <Suspense fallback={<ResultsPageSkeleton />}>
      <PublicResultContent params={params} />
    </Suspense>
  );
}
