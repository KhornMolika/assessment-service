import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAssessmentDetailPageData } from "@/src/domains/assessment/api/assessment.api";
import AssessmentDetailView from "@/src/domains/assessment/components/assessment-detail/AssessmentDetailView";
import { WorkspacePageSkeleton } from "@/src/shared/components/layout/PageSkeletons";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Assessment Detail | Assessments",
    description: "Assessment setup, delivery settings, sharing, reports, and questions.",
  };
}

async function AssessmentDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAssessmentDetailPageData(id);

  if (!data) {
    notFound();
  }

  return <AssessmentDetailView data={data} />;
}

export default function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <AssessmentDetailPageContent params={params} />
    </Suspense>
  );
}
