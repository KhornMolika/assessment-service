import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAssessmentResultSheetPageData } from "@/src/domains/assessment/api/assessment.api";
import ResultSheetDetailView from "@/src/domains/assessment/components/results/ResultSheetDetailView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getAssessmentResultSheetPageData(id);

  if (!data) {
    return {
      title: "Result Detail Not Found",
    };
  }

  return {
    title: `${data.participant.display_name} Result | Results`,
    description: `Participant answer sheet detail for ${data.assessment.title}`,
  };
}

export default async function ResultSheetPage({
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
