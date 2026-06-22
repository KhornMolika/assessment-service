import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAssessmentDetailPageData } from "@/src/api/assessment.api";
import AssessmentDetailView from "@/src/components/assessment/assessment-detail/AssessmentDetailView";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";



export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Assessment Detail | Assessments",
    description: "Assessment setup, delivery settings, sharing, reports, and questions.",
  };
}

async function AssessmentDetailPageContent({
  dataPromise,
}: {
  dataPromise: Promise<Awaited<ReturnType<typeof getAssessmentDetailPageData>>>;
}) {
  const data = await dataPromise;

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
      <AssessmentDetailPageContent
        dataPromise={params.then(({ id }) => getAssessmentDetailPageData(id))}
      />
    </Suspense>
  );
}
