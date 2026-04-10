import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAssessmentDetailPageData } from "@/src/domains/assessment/api/assessment.api";
import AssessmentDetailView from "@/src/domains/assessment/components/assessment-detail/AssessmentDetailView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getAssessmentDetailPageData(id);

  if (!data) {
    return {
      title: "Assessment Not Found",
    };
  }

  return {
    title: `${data.assessment.title} | Assessments`,
    description: data.assessment.subtitle,
  };
}

export default async function AssessmentDetailPage({
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
