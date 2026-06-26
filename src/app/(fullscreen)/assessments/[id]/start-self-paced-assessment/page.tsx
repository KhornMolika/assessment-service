import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAssessmentCatalogItemById, getAssessmentDetailPageData } from "@/src/api/assessment.api";
import { StartSelfPacedScreen } from "@/src/components/assessment/session/SessionScreens";
import { SessionLoading } from "@/src/components/assessment/session/SessionLoading";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Take Assessment",
    description: "Join and complete a self-paced assessment.",
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
