import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAssessmentCatalogItemById, getAssessmentDetailPageData } from "@/src/api/assessment.api";
import { StartSelfPacedScreen } from "@/src/components/assessment/session/SessionScreens";
import { SessionLoading } from "@/src/components/assessment/session/SessionLoading";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  let title = "Take Assessment | Assessment Service";
  let description = "Join and complete a self-paced assessment.";
  
  try {
    const assessment = await getAssessmentCatalogItemById(id);
    if (assessment) {
      title = `${assessment.name} | Assessment Service`;
      description = `Join and complete the ${assessment.name} assessment.`;
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

async function AssessmentStartSelfPacedPageContent({
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

  return <StartSelfPacedScreen assessment={detail.assessment} questions={detail.questions} />;
}

export default function AssessmentStartSelfPacedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<SessionLoading />}>
      <AssessmentStartSelfPacedPageContent params={params} />
    </Suspense>
  );
}
