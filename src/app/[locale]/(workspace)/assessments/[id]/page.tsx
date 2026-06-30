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
  searchParamsPromise,
}: {
  dataPromise: Promise<Awaited<ReturnType<typeof getAssessmentDetailPageData>>>;
  searchParamsPromise: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [data, searchParams] = await Promise.all([dataPromise, searchParamsPromise]);

  if (!data) {
    notFound();
  }

  const editBlocked = searchParams.editBlocked === "true";

  return <AssessmentDetailView data={data} editBlocked={editBlocked} />;
}

export default function AssessmentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <AssessmentDetailPageContent
        dataPromise={params.then(({ id }) => getAssessmentDetailPageData(id))}
        searchParamsPromise={searchParams}
      />
    </Suspense>
  );
}
