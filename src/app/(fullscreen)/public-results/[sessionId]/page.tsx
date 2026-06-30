import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAssessmentResultSheetPageData } from "@/src/api/assessment.api";
import { PublicResultClient } from "@/src/components/assessment/session/PublicResultClient";
import { ResultsPageSkeleton } from "@/src/components/ui/layout/PageSkeletons";

export async function generateMetadata({ params }: { params: Promise<{ sessionId: string }> }): Promise<Metadata> {
  const { sessionId } = await params;
  let title = "Assessment Result | Assessment Service";
  let description = "View the assessment result.";
  
  try {
    const data = await getAssessmentResultSheetPageData(sessionId);
    if (data && data.assessment) {
      title = `${data.participant.display_name}'s Result: ${data.assessment.name}`;
      description = `View ${data.participant.display_name}'s performance on the ${data.assessment.name} assessment.`;
    }
  } catch (error) {
    // Fallback to defaults
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Assessment Service",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
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
