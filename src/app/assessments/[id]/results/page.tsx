import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAssessmentCatalogItemById,
  getAssessmentScopedResultsPageData,
} from "@/src/domains/assessment/api/assessment.api";
import AssessmentScopedResultsView from "@/src/domains/assessment/components/assessment-results/AssessmentScopedResultsView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const assessment = await getAssessmentCatalogItemById(id);

  if (!assessment) {
    return {
      title: "Assessment Results Not Found",
    };
  }

  return {
    title: `${assessment.title} Results`,
    description: `Assessment-level results and review progress for ${assessment.title}.`,
  };
}

export default async function AssessmentResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAssessmentScopedResultsPageData(id);

  if (!data) {
    notFound();
  }

  return <AssessmentScopedResultsView data={data} />;
}
