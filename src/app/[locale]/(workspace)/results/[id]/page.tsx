import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAssessmentResultSheetPageData } from "@/src/api/assessment.api";
import ResultSheetDetailView from "@/src/components/assessment/results/ResultSheetDetailView";
import { ResultsPageSkeleton } from "@/src/components/ui/layout/PageSkeletons";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Result Detail | Results",
    description: "Participant answer sheet detail and scoring review.",
  };
}

async function ResultSheetPageContent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ backHref?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const data = await getAssessmentResultSheetPageData(id);

  if (!data) {
    notFound();
  }

  const backHref =
    resolvedSearchParams?.backHref && resolvedSearchParams.backHref.startsWith("/")
      ? resolvedSearchParams.backHref
      : undefined;

  return <ResultSheetDetailView data={data} backHref={backHref} />;
}

export default function ResultSheetPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ backHref?: string }>;
}) {
  return (
    <Suspense fallback={<ResultsPageSkeleton />}>
      <ResultSheetPageContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
