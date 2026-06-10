import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAssessmentCatalogItemById, getAssessmentDetailPageData } from "@/src/api/assessment.api";
import { AssessmentTakeScreen } from "@/src/components/assessment/session/AssessmentSessionScreens";
import { AssessmentSessionLoading } from "@/src/components/assessment/session/AssessmentSessionLoading";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Take Assessment",
    description: "Join and complete a self-paced assessment.",
  };
}

async function AssessmentTakePageContent({
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

  return <AssessmentTakeScreen assessment={detail.assessment} questions={detail.questions} />;
}

export default function AssessmentTakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<AssessmentSessionLoading />}>
      <AssessmentTakePageContent params={params} />
    </Suspense>
  );
}
