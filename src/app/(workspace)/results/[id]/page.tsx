import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAssessmentResultSheetPageData } from "@/src/components/assessment/api/assessment.api";
import ResultSheetDetailView from "@/src/components/assessment/components/results/ResultSheetDetailView";
import { ResultsPageSkeleton } from "@/src/components/ui/layout/PageSkeletons";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Result Detail | Results",
    description: "Participant answer sheet detail and scoring review.",
  };
}

async function ResultSheetPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAssessmentResultSheetPageData(id);

  if (!data) {
    notFound();
  }

  return <ResultSheetDetailView data={data} />;
}

export default function ResultSheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<ResultsPageSkeleton />}>
      <ResultSheetPageContent params={params} />
    </Suspense>
  );
}
